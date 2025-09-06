<template>
  <v-container fluid class="page-bg">
    <v-card class="pa-6 custom-card" elevation="7">
      <!-- Header -->
      <div class="header">
        <!-- زر الرجوع -->
        <v-btn class="back-btn" color="#5A94F3" small @click="goBack">
          <v-icon left>mdi-arrow-left</v-icon>
        </v-btn>

        <h1 class="custom-titleB">Teacher Profile</h1>

        <div class="header-right">
          <v-chip class="chip-soft chip-warning" size="small">
            ID: {{ teacher?.id ?? '-' }}
          </v-chip>
        </div>
      </div>

      <v-card-text>
        <v-row class="mt-2" justify="center">
          <v-col cols="12" sm="4" md="3" class="text-center">
            <v-avatar size="180" class="mx-auto avatar-ring">
              <v-img
                :src="imageUrl || logo"
                alt="Teacher Image"
                class="rounded-circle custom-image"
                cover
              />
            </v-avatar>

            <div class="mt-3">
              <h3 class="name">{{ teacher?.name || '—' }}</h3>
              <p class="muted-text">{{ teacher?.specialization || '—' }}</p>
            </div>
          </v-col>

          <!-- معلومات سريعة -->
          <v-col cols="12" sm="8" md="9">
            <v-row>
              <v-col
                v-for="(value, key) in displayedFields"
                :key="key"
                cols="12"
                sm="6"
                md="4"
              >
                <div class="info-block">
                  <div class="info-label">{{ key }}</div>
                  <div class="info-value">{{ value ?? 'لا يوجد' }}</div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- ملخص المواد -->
        <v-row class="mt-6">
          <!-- المواد المقبولة -->
          <v-col cols="12" md="4">
            <div class="summary-card border-success">
              <div class="summary-title">
                Accepted
                <v-chip class="chip-soft chip-success" size="small">
                  {{ acceptedSubjects.length }}
                </v-chip>
              </div>

              <div class="chip-stack">
                <v-chip
                  v-for="subject in acceptedSubjects"
                  :key="subject.id + subject.name"
                  class="chip-solid chip-success"
                  variant="elevated"
                  size="small"
                >
                  {{ subject.name }}
                  <v-icon
                    small
                    class="ml-1 delete-icon"
                    @click.stop="confirmDelete(subject.id)"
                  >
                    mdi-close
                  </v-icon>
                </v-chip>
                <p v-if="!acceptedSubjects.length" class="muted-text">
                  no accepted subjects
                </p>
              </div>
            </div>
          </v-col>

          <!-- المواد قيد المراجعة -->
          <v-col cols="12" md="4">
            <div class="summary-card border-warning">
              <div class="summary-title">
                Pending
                <v-chip class="chip-soft chip-warning" size="small">
                  {{ pendingSubjects.length }}
                </v-chip>
              </div>

              <div class="chip-stack">
                <v-chip
                  v-for="subject in pendingSubjects"
                  :key="subject.id + subject.name"
                  class="chip-soft chip-warning"
                  size="small"
                >
                  {{ subject.name }}
                </v-chip>
                <p v-if="!pendingSubjects.length" class="muted-text">
                  no pending subjects
                </p>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- حوار تأكيد الحذف -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-text>Are you sure you want to delete subject from teacher?</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="deleteDialog = false" color="#5A94F3">cancel</v-btn>
            <v-btn color="#ef4444" text @click="deleteSubject">delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { getApi } from '@/BaseUrl'
import logo from '../assets/logo.svg'

const { url } = getApi()
const route = useRoute()
const router = useRouter()

const teacher = ref({})
const imageUrl = ref('')
const acceptedSubjects = ref([])
const pendingSubjects = ref([])
const rejectedSubjects = ref([])

const deleteDialog = ref(false)
const subjectToDelete = ref(null)

// دالة الرجوع
function goBack() {
  router.push('/home/teachers')
}

// فتح نافذة تأكيد الحذف
function confirmDelete(id) {
  subjectToDelete.value = id
  deleteDialog.value = true
}

// تنفيذ حذف المادة
async function deleteSubject() {
  try {
    const token = localStorage.getItem('token')
    await axios.post(
      `${url}/delete/teacher/from/subject`,
      {
        teacher_id: teacher.value.id,
        subject_id: subjectToDelete.value
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    // تحديث القائمة محليًا
    acceptedSubjects.value = acceptedSubjects.value.filter(
      (s) => s.id !== subjectToDelete.value
    )
    deleteDialog.value = false
    subjectToDelete.value = null
  } catch (error) {
    console.error('Error deleting subject:', error)
  }
}

// تقسيم المواد حسب الحالة (fallback)
function splitSubjectsByStatus(raw) {
  const acc = [], pen = [], rej = []
  if (!Array.isArray(raw)) return { acc, pen, rej }

  for (const item of raw) {
    if (typeof item === 'string') {
      pen.push(item)
      continue
    }
    const name =
      item?.name ||
      item?.subject_name ||
      item?.title ||
      item?.subject ||
      item?.code ||
      'Subject'
    const statusStr = String(item?.status ?? '').toLowerCase()
    const boolAccepted =
      item?.is_accepted === true ||
      item?.accepted === true ||
      item?.isAccepted === true ||
      item?.accepted === 1 ||
      item?.is_accepted === 1

    if (statusStr === 'accepted' || boolAccepted) acc.push(name)
    else if (statusStr === 'rejected' || item?.accepted === false || item?.is_accepted === 0)
      rej.push(name)
    else pen.push(name)
  }
  return { acc, pen, rej }
}

// جلب بيانات المعلم
const getTeacherDetails = async () => {
  try {
    const id = route.params.id
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${url}/get/all/profile/teacher/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    teacher.value = {
      ...(data?.teacher || {}),
      ...(data?.profile || {})
    }

    // حالة الـ API الجديد
    if (data.subjects && typeof data.subjects === 'object') {
      acceptedSubjects.value = (data.subjects.accepted || []).map((s) => ({
        id: s.id || s.subject_id,
        name: s.title || s.subject_name || s
      }))
      pendingSubjects.value = (data.subjects.pending || []).map((s) => ({
        id: s.id || s.subject_id,
        name: s.title || s.subject_name || s
      }))
    } else {
      // fallback قديم
      const arr = Array.isArray(data.subjects)
        ? data.subjects
        : Array.isArray(data.data?.subjects)
        ? data.data.subjects
        : Array.isArray(data.teacher?.subjects)
        ? data.teacher.subjects
        : []
      const { acc, pen } = splitSubjectsByStatus(arr)
      acceptedSubjects.value = acc.map((name) => ({ id: null, name }))
      pendingSubjects.value = pen.map((name) => ({ id: null, name }))
    }

    imageUrl.value = teacher.value.user_image || teacher.value.image || ''
  } catch (error) {
    console.error('Error loading teacher details:', error?.response?.data || error)
  }
}

onMounted(() => {
  getTeacherDetails()
})

// الحقول المعروضة
const displayedFields = computed(() => ({
  'Phone Number': teacher.value?.phone,
  Email: teacher.value?.email,
  province: teacher.value?.province ?? 'none', 
  age: teacher.value?.age ?? 'none ',
  teaching_start_date: teacher.value?.teaching_start_date ?? 'none ',
  bio: teacher.value?.bio ?? 'none ',
  specialization: teacher.value?.specialization ?? 'none '
}))
</script>

<style>
:root {
  --primary: #5A94F3;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border: #e5e7eb;
  --surface: #ffffff;
  --muted: #94a3b8;
}

.page-bg {
  background-color: var(--background);
  padding: 28px 0;
}

.custom-card {
  background-color: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0px 10px 28px rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  max-width: 1700px;
  margin: auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  margin-right: 16px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.custom-titleB {
  color: var(--primary);
  font-size: 33px;
  font-weight: 800;
  margin: 0;
}

.name {
  color: var(--text-primary);
  font-size: 30px;
  font-weight: 700;
  margin: 0;
}

.muted-text {
  color: var(--muted);
  font-size: 24px;
  margin-top: 4px;
}

.avatar-ring {
  box-shadow:
    0 0 0 4px var(--surface),
    0 0 0 8px var(--warning);
  border-radius: 50%;
}

.custom-image {
  border: 4px solid var(--surface);
  border-radius: 50%;
}

.info-block {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.6), rgba(255, 255, 255, 0.9));
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  min-height: 84px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-label {
  color: var(--text-secondary);
  font-size: 18px;
  margin-bottom: 4px;
}

.info-value {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 20px;
}

.summary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  height: 100%;
}

.summary-title {
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.border-success {
  box-shadow: inset 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.border-warning {
  box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.15);
}

.chip-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-soft {
  background-color: rgba(15, 23, 42, 0.04) !important;
  border: 1px solid var(--border) !important;
  color: var(--text-primary) !important;
}

.chip-success {
  background-color: rgba(16, 185, 129, 0.12) !important;
  border-color: rgba(16, 185, 129, 0.35) !important;
  color: #065f46 !important;
}

.chip-warning {
  background-color: rgba(245, 158, 11, 0.12) !important;
  border-color: rgba(245, 158, 11, 0.35) !important;
  color: #7c2d12 !important;
}

.chip-error {
  background-color: rgba(239, 68, 68, 0.12) !important;
  border-color: rgba(239, 68, 68, 0.35) !important;
  color: #991b1b !important;
}

.chip-solid.chip-success {
  background-color: var(--success) !important;
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.delete-icon {
  cursor: pointer;
}
</style>