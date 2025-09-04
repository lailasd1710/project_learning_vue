<template>
  <v-container fluid class="our_school">
    <h1 class="mb-9" style="color:  #3B82F6  ; text-align: center;">
      Lessons
    </h1>

    <v-row justify="center" class="form-row">
      <!-- Subject selector -->
      <v-col cols="12" sm="6" md="3">
        <v-select
          clearable
          label="Select Subject"
          color=" #3B82F6 "
          :items="subjects"
          item-value="id"
          item-title="title"
          variant="outlined"
          v-model="selectedSubjectId"
          @change="onSubjectChange"
        />
      </v-col>

      <!-- Teacher selector -->
      <v-col cols="12" sm="6" md="3">
        <v-select
          clearable
          label="Select Teacher"
          color=" #3B82F6 "
          :items="teachers"
          item-value="id"
          item-title="name"
          variant="outlined"
          v-model="selectedTeacherId"
          @change="onTeacherChange"
        />
      </v-col>

      <!-- Lesson selector (wired later) -->
      <v-col cols="12" sm="6" md="3">
        <v-select
          clearable
          label="Select Lesson"
          color=" #3B82F6 "
          :items="titles"
          item-value="id"
          item-title="title"
          variant="outlined"
          v-model="selectedTitleId"
        />
      </v-col>

      <!-- Fetch lessons button -->
      <v-col cols="12" sm="6" class="d-flex justify-center align-center">
        <v-btn class="custom-buttonb" @click="fetchLessonsForSubject">
          SELECTION
        </v-btn>
      </v-col>
    </v-row>

    <!-- Display lessons -->
    <v-row justify="center" v-if="lessons.length" class="lessons-row">
      <v-col
        cols="12"
        md="8"
        v-for="lesson in lessons"
        :key="lesson.id"
        class="lesson-col"
      >
        <v-card class="my-3 lesson-card" elevation="4">
          <v-card-title class="video-title">
            {{ lesson.title || 'بدون عنوان' }}
          </v-card-title>
          <v-card-text>
            <AdvancedVideo
              v-if="lesson.cldVid"
              :cldVid="lesson.cldVid"
              controls
              style="width: 100%; height: 100%;"
            />
            <div v-if="lesson.description">{{ lesson.description }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Illustration -->
    <v-row justify="center" class="image-row">
      <v-col cols="12" md="6" class="d-flex justify-center">
        <v-img src="@/assets/online-learning.png" aspect-ratio="1.7" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import {getApi} from '@/BaseUrl'
const { url } = getApi()

const subjects          = ref([]);
const teachers          = ref([]);
const titles            = ref([]);
const lessons           = ref([]);

const selectedSubjectId = ref(null);
const selectedTeacherId = ref(null);
const selectedTitleId   = ref(null);

// 1) Load subjects
const fetchSubjects = async () => {
  try {
    const res = await axios.get(`${url}/get/subjects`);
    subjects.value = Array.isArray(res.data.subjects)
      ? res.data.subjects
      : [];
  } catch (e) {
    console.error('Error fetching subjects:', e);
  }
};

// 2) Load teachers for chosen subject
const fetchTeachers = async (subjectId) => {
  if (!subjectId) {
    teachers.value = [];
    return;
  }
  try {
    const res = await axios.get(
      `${url}/get/teachers/subject/${subjectId}`
    );
    // API returns an array at root
    teachers.value = Array.isArray(res.data)
      ? res.data
      : [];
  } catch (e) {
    console.error('Error fetching teachers:', e);
  }
};

// 3) Load titles stub (wired later)
const fetchTitles = async (teacherId) => {
  if (!teacherId) {
    titles.value = [];
    return;
  }
  // your existing titles fetch...
};

// 4) Fetch lessons using new endpoint:
//    - teacherId in URL
//    - subjectId in body
//    - Bearer token in headers
const fetchLessonsForSubject = async () => {
  if (!selectedSubjectId.value || !selectedTeacherId.value) {
    console.warn('Subject or teacher not selected');
    return;
  }
  try {
    // grab token from localStorage (or wherever you store it)
    const token = localStorage.getItem('token');
    const res = await axios.post(
      `${url}/guest/lesson_teacher_subject/${selectedTeacherId.value}`,
      { subject_id: selectedSubjectId.value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // assume lessons come back under res.data.data
    lessons.value = Array.isArray(res.data.data)
      ? res.data.data.map(lesson => ({
          ...lesson,
          cldVid: cld.video(lesson.video), // if using Cloudinary
        }))
      : [];
  } catch (e) {
    console.error('Error fetching lessons:', e);
    lessons.value = [];
  }
};

const onSubjectChange = (id) => {
  selectedTeacherId.value = null;
  titles.value = [];
  selectedTitleId.value = null;
  fetchTeachers(id);
};

const onTeacherChange = (id) => {
  selectedTitleId.value = null;
  fetchTitles(id);
};

watch(selectedSubjectId, fetchTeachers);
watch(selectedTeacherId, fetchTitles);

// initial load
fetchSubjects();
</script>


<style scoped>
.v-card {
  border-radius: 10px;
  background-color: #ffffff !important;
}

.button-add {
  position: fixed !important;
  bottom: 0.4cm !important;
  right: 0.4cm !important;
}

.custom-buttonb {
  background-color:  #3B82F6   !important;
  color: white !important;
  transition: transform 0.2s;
  border-radius: 40px;
  width: 48%;
  font-size: 17px;
}

.custom-buttonb:hover {
  transform: scale(1.05);
}

.custom-buttonb:active {
  transform: scale(0.95);
}

.form-row {
  margin-bottom: 20px;
}

.lessons-row {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lesson-col {
  width: 100%;
}

.lesson-card {
  width: 100%;
  max-width: 1000px;
  background-color: #ffffff;
}

.image-row {
  margin-top: 20px;
  margin-bottom: 20px;
}

.video-title {
  color: #b271a7;
  text-align: center;
  width: 100%;
  font-size: 20px;
}
</style>