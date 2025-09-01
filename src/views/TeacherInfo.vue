<template>
  <v-container fluid class="page-bg">
    <v-card class="pa-6 custom-card" elevation="7">
      <!-- Header -->
      <div class="header">
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
              <v-col v-for="(value, key) in displayedFields" :key="key" cols="12" sm="6" md="4">
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
                  v-for="(s, i) in acceptedSubjects"
                  :key="'a' + i"
                  class="chip-solid chip-success"
                  variant="elevated"
                  size="small"
                >
                  {{ s }}
                </v-chip>
                <p v-if="!acceptedSubjects.length" class="muted-text">لا يوجد مواد مقبولة</p>
              </div>
            </div>
          </v-col>
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
                  v-for="(s, i) in pendingSubjects"
                  :key="'p' + i"
                  class="chip-soft chip-warning"
                  size="small"
                >
                  {{ s }}
                </v-chip>
                <p v-if="!pendingSubjects.length" class="muted-text">لا يوجد مواد قيد المراجعة</p>
              </div>
            </div>
          </v-col>

        
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import logo from '../assets/logo.svg'
const route = useRoute()
const teacher = ref({})
const imageUrl = ref('')
const acceptedSubjects = ref([])
const pendingSubjects = ref([])
const rejectedSubjects = ref([])

function splitSubjectsByStatus(raw) {
  const acc = [],
    pen = [],
    rej = []
  if (!Array.isArray(raw)) return { acc, pen, rej }

  for (const item of raw) {
    if (typeof item === 'string') {
      pen.push(item)
      continue
    }

    const name =
      item?.name || item?.subject_name || item?.title || item?.subject || item?.code || 'Subject'

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

const getTeacherDetails = async () => {
  try {
    const id = route.params.id
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`http://127.0.0.1:8000/api/get/all/profile/teacher/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    teacher.value = {
      ...(data?.teacher || {}),
      ...(data?.profile || {}),
    }

    const candidates =
      (Array.isArray(data?.subjects) && data.subjects) ||
      (Array.isArray(data?.data?.subjects) && data.data.subjects) ||
      (Array.isArray(data?.teacher?.subjects) && data.teacher.subjects) ||
      (Array.isArray(teacher.value?.subjects) && teacher.value.subjects) ||
      []

    
if (data.subjects && typeof data.subjects === 'object') {
  // نملأ accepted/pending مباشرة ونمسح المرفوضة
  const { accepted = [], pending = [] } = data.subjects
  acceptedSubjects.value = accepted.map(s => s.title || s.subject_name || s)
  pendingSubjects.value  = pending .map(s => s.title || s.subject_name || s)

}
else {
  // fallback على الحالة القديمة
  const arr =
    Array.isArray(data.subjects)        ? data.subjects        :
    Array.isArray(data.data?.subjects) ? data.data.subjects   :
    Array.isArray(data.teacher?.subjects)
                                       ? data.teacher.subjects
                                       : []
  const { acc, pen } = splitSubjectsByStatus(arr)
  acceptedSubjects.value = acc
  pendingSubjects.value  = pen
}


    imageUrl.value = teacher.value.user_image || teacher.value.image || ''
  } catch (error) {
    console.error('Error loading teacher details:', error?.response?.data || error)
  }
}

onMounted(() => {
  getTeacherDetails()
})

const displayedFields = computed(() => ({
  'Phone Number': teacher.value?.phone,
  Email: teacher.value?.email,
  province: teacher.value?.province ?? 'لا يوجد',
  age: teacher.value?.age ?? 'لا يوجد',
  teaching_start_date: teacher.value?.teaching_start_date ?? 'لا يوجد',
  bio: teacher.value?.bio ?? 'لا يوجد',
  specialization: teacher.value?.specialization ?? 'لا يوجد',
}))
</script>

<style>
:root {
  --primary: #3b82f6; /* Primary */
  --success: #10b981; /* Success */
  --warning: #f59e0b; /* Warning */
  --error: #ef4444; /* Error */
  --text-primary: #0f172a; /* Text Primary */
  --text-secondary: #475569; /* Text Secondary */
  --border: #e5e7eb; /* Border */
  --surface: #ffffff; /* Surface / Card */
  --muted: #94a3b8; /* Muted */
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
.border-error {
  box-shadow: inset 0 0 0 2px rgba(239, 68, 68, 0.15);
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
</style>
