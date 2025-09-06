<!-- src/views/Lessons.vue -->
<template>
  <v-container fluid class="our_school">
    <!-- Page title -->
    <h1 class="mb-9" style="color: #5A94F3; text-align: center;">
      Lessons
    </h1>

    <!-- selectors row -->
    <v-row justify="center" class="form-row">
      <!-- Subject selector -->
      <v-col cols="12" sm="6" md="3">
        <v-select
          clearable
          label="Select Subject"
          :items="subjects"
          item-value="id"
          item-title="title"
          variant="outlined"
          color="#5A94F3"
          v-model="selectedSubjectId"
        />
      </v-col>

      <!-- Teacher selector -->
      <v-col cols="12" sm="6" md="3">
        <v-select
          clearable
          label="Select Teacher"
          :items="teachers"
          item-value="id"
          item-title="name"
          variant="outlined"
          color="#5A94F3"
          v-model="selectedTeacherId"
        />
      </v-col>

      <!-- Lesson titles dropdown -->
      <v-col cols="12" sm="6" md="3">
        <v-select
          clearable
          label="Select Lesson"
          :items="titles"
          item-value="id"
          item-title="title"
          variant="outlined"
          color="#5A94F3"
          v-model="selectedTitleId"
        />
      </v-col>
    </v-row>

    <!-- selection button -->
    <v-row justify="center" class="form-row">
      <v-col cols="12" sm="6" md="3" class="d-flex align-center">
        <v-btn class="custom-buttonb" @click="showSelectedLesson = true">
          Selection
        </v-btn>
      </v-col>
    </v-row>

    <!-- lesson card: wraps video, summary & comments -->
    <v-row justify="center" class="lessons-row">
      <v-col
        cols="12"
        md="8"
        v-if="showSelectedLesson && selectedLesson"
      >
        <v-card
          class="my-3 lesson-card pa-4"
          elevation="4"
          style="background-color: #E3ECFB;"
        >
          <!-- Lesson title -->
          <v-card-title
            class="video-title"
            style="color: #5A94F3;
                   text-align: center;
                   font-size: 20px;
                   font-weight: bold;
                   margin-bottom: 8px;"
          >
            {{ selectedLesson.title }}
          </v-card-title>

          <!-- Video & summary -->
          <v-card-text>
            <video
              v-if="selectedLesson.video_path"
              controls
              :src="selectedLesson.video_path"
              class="lesson-video"
              style="width: 100%; margin-bottom: 16px;"
            ></video>

            <v-card class="summary-mini pa-2" style="background: white;">
              <div class="summary-text">
                <a
                  :href="selectedLesson.summary_path"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="color: #5A94F3; text-decoration: none; font-weight: 500;"
                >
                  View Summary
                </a>
              </div>
            </v-card>
          </v-card-text>

          <!-- comments section -->
          <div v-if="comments.length" class="comments-section" style="margin-top: 24px;">
            <h2 class="comments-title" style="color: #5A94F3; font-size: 18px; margin-bottom: 16px;">
              Comments
            </h2>
            <v-card
              v-for="comment in comments"
              :key="comment.id"
              class="comment-card mb-4 pa-4"
              elevation="2"
            >
              <!-- comment header -->
              <v-card-title class="comment-header" style="display: flex; justify-content: space-between;">
                <span class="comment-user" style="font-weight: 600;">
                  {{ comment.user.name }}
                </span>
                <span class="comment-date" style="color: gray; font-size: 12px;">
                  {{ formatDate(comment.created_at) }}
                </span>
              </v-card-title>

              <!-- comment content -->
              <v-card-text class="comment-content" style="margin-bottom: 12px;">
                {{ comment.content }}
              </v-card-text>

              <!-- nested reply (if any) -->
              <v-card
                v-if="replies[comment.id]?.length"
                class="reply-card pa-3"
                elevation="1"
                style="background: #F5F7FA; margin-left: 24px;"
              >
                <v-card-title class="reply-header" style="display: flex; justify-content: space-between;">
                  <span class="reply-user" style="font-weight: 600;">
                    {{ replies[comment.id][0].user.name }}
                  </span>
                  <span class="reply-date" style="color: gray; font-size: 12px;">
                    {{ formatDate(replies[comment.id][0].created_at) }}
                  </span>
                </v-card-title>
                <v-card-text class="reply-content">
                  {{ replies[comment.id][0].content }}
                </v-card-text>
              </v-card>
            </v-card>
          </div>

          <p v-else class="no-comments" style="text-align: center; color: gray; margin-top: 24px;">
            No comments yet.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Illustration (unchanged) -->
    <v-row justify="center" class="image-row">
      <v-col cols="12" md="6" class="d-flex justify-center">
        <v-img src="@/assets/online-learning.png" aspect-ratio="1.7" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue'
import axios from 'axios'
import { getApi } from '@/BaseUrl'

const { url } = getApi()

// reactive state
const subjects = ref([])
const teachers = ref([])
const titles = ref([])
const allLessons = ref([])
const comments = ref([])
const replies = reactive({})

// user selections & visibility flag
const selectedSubjectId = ref(null)
const selectedTeacherId = ref(null)
const selectedTitleId = ref(null)
const showSelectedLesson = ref(false)

// currently selected lesson object
const selectedLesson = computed(() =>
  allLessons.value.find(l => l.id === selectedTitleId.value) || null
)

// format ISO date into "MMM DD, YYYY hh:mm"
function formatDate(isoString) {
  const opts = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(isoString).toLocaleDateString('en-US', opts)
}

// 1) Load subjects on mount
async function fetchSubjects() {
  try {
    const res = await axios.get(`${url}/get/subjects`)
    subjects.value = Array.isArray(res.data.subjects) ? res.data.subjects : []
  } catch (e) {
    console.error('Error fetching subjects:', e)
  }
}
onMounted(fetchSubjects)

// 2) Reset & hide lesson card + clear comments/replies whenever any selector changes
watch(
  () => [selectedSubjectId.value, selectedTeacherId.value, selectedTitleId.value],
  () => {
    showSelectedLesson.value = false
    comments.value = []
    Object.keys(replies).forEach(k => delete replies[k])
  }
)

// 3) Load teachers when subject changes
watch(selectedSubjectId, async newId => {
  selectedTeacherId.value = null
  titles.value = []
  allLessons.value = []
  if (!newId) {
    teachers.value = []
    return
  }
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(
      `${url}/get/teachers/subject/${newId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    teachers.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error('Error fetching teachers:', e)
    teachers.value = []
  }
})

// 4) Load lessons when teacher changes
watch(selectedTeacherId, async newTeacherId => {
  selectedTitleId.value = null
  titles.value = []
  allLessons.value = []
  if (!newTeacherId || !selectedSubjectId.value) return

  try {
    const token = localStorage.getItem('token')
    const form = new FormData()
    form.append('subject_id', selectedSubjectId.value)

    const res = await axios.post(
      `${url}/get/lessons/teacher/${newTeacherId}`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    const payload = Array.isArray(res.data.lessons) ? res.data.lessons : []
    allLessons.value = payload.map(item => ({
      id: item.id,
      title: item.title,
      video_path: item.video_path,
      summary_path: item.summary_path
    }))
    titles.value = allLessons.value.map(l => ({ id: l.id, title: l.title }))
  } catch (err) {
    console.error('Error fetching lessons:', err)
  }
})

// 5) Fetch comments & replies when lesson card opens
watch(showSelectedLesson, async show => {
  if (!show || !selectedTitleId.value) return
  try {
    const token = localStorage.getItem('token')
    // fetch comments
    const cRes = await axios.get(
      `${url}/get/comment/lesson/${selectedTitleId.value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    comments.value = Array.isArray(cRes.data) ? cRes.data : []

    // fetch replies for each comment
    for (const c of comments.value) {
      const rRes = await axios.get(
        `${url}/get/replies/comment/${c.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      replies[c.id] = Array.isArray(rRes.data) ? rRes.data : []
    }
  } catch (e) {
    console.error('Error fetching comments or replies:', e)
  }
})
</script>

<style scoped>
/* spacing around form row */
.form-row {
  margin-bottom: 20px;
}

/* selection button style */
.custom-buttonb {
  background-color: #5A94F3 !important;
  color: white !important;
  width: 100%;
}

/* lesson video spacing */
.lesson-video {
  width: 100%;
  max-height: 450px;
  display: block;
  margin: 0 auto 12px;
  border-radius: 4px;
}

/* summary mini-card */
.summary-mini {
  max-width: 400px;
  margin: 0 auto;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
.summary-text a {
  font-size: 16px;
  color: #3b82f6;
  font-weight: bold;
  text-align: center;
  display: block;
}

/* Comments section */
.comments-section {
  margin-top: 24px;
  margin-bottom: 24px;
}
.comments-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #3b82f6;
  text-align: left;
}

/* comment card */
.comment-card {
  background: #f9f9f9;
  border-radius: 8px;
}
/* comment header */
.comment-header {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
}
.comment-user {
  color: #0f172a;
}
.comment-date {
  color: #475569;
  font-size: 14px;
}
/* comment content */
.comment-content {
  padding-left: 16px;
  color: #333;
}

/* reply card nested inside comment */
.reply-card {
  background: #ffffff;
  border-left: 3px solid #3b82f6;
  border-radius: 6px;
}
.reply-header {
  display: flex;
  justify-content: space-between;
  font-weight: 400;
  font-size: 14px;
}
.reply-user {
  color: #0f172a;
}
.reply-date {
  color: #94a3b8;
  font-size: 12px;
}
.reply-content {
  padding-left: 12px;
  color: #475569;
  font-size: 14px;
}

/* no comments message */
.no-comments {
  text-align: center;
  color: #94a3b8;
  padding: 16px;
}

/* illustration row spacing */
.image-row {
  margin: 20px 0;
}
</style>