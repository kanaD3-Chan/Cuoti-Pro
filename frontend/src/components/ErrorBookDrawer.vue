<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Calendar, ArrowRight, Filter } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useErrorBookStore } from '@/stores/errorBookStore'
import type { WrongQuestionItem } from '@/types/chat'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const store = useErrorBookStore()
const selectedSubject = ref('全部')
const selectedId = ref<string | null>(null)

const filteredItems = computed(() => {
  if (selectedSubject.value === '全部') return store.items
  return store.items.filter((i) => i.subject === selectedSubject.value)
})

const selectedDetail = computed(() => {
  if (!selectedId.value) return null
  return store.ensureDetail(selectedId.value)
})

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      selectedId.value = null
      selectedSubject.value = '全部'
    } else {
      selectedId.value = null
    }
  }
)

function viewDetail(item: WrongQuestionItem) {
  selectedId.value = item.id
}

function closeDetail() {
  selectedId.value = null
}

function close() {
  emit('update:visible', false)
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function confirmArchive(item: WrongQuestionItem) {
  store.confirmArchive(item.id)
  ElMessage.success(`已确认归档：${item.knowledge_point}`)
}

function archiveAll() {
  const reviewItems = filteredItems.value.filter((i) => i.reason_summary.includes('复核'))
  for (const item of reviewItems) {
    store.confirmArchive(item.id)
  }
  if (reviewItems.length) {
    ElMessage.success(`已批量确认 ${reviewItems.length} 道待复核错题`)
  }
}
</script>

<template>
  <el-drawer
    v-model="props.visible"
    title="我的错题本"
    direction="rtl"
    size="420px"
    :with-header="true"
    class="error-book-drawer"
    @closed="close"
  >
    <div v-if="!selectedDetail" class="error-book">
      <!-- 科目筛选 -->
      <div class="filter-bar">
        <div class="filter-label">
          <el-icon><Filter /></el-icon> 科目
        </div>
        <div class="filter-tags">
          <button
            class="filter-tag"
            :class="{ active: selectedSubject === '全部' }"
            @click="selectedSubject = '全部'"
          >
            全部
          </button>
          <button
            v-for="sub in store.subjects"
            :key="sub"
            class="filter-tag"
            :class="{ active: selectedSubject === sub }"
            @click="selectedSubject = sub"
          >
            {{ sub }}
          </button>
        </div>
      </div>

      <div v-if="!filteredItems.length" class="empty">
        <div class="empty__icon">📚</div>
        <div class="empty__text">暂无错题</div>
        <div class="empty__sub">上传作业批改后，错题会自动归档到这里</div>
      </div>
      <div v-else class="error-list">
        <div class="list-header">
          <span>共 {{ filteredItems.length }} 题</span>
          <button v-if="filteredItems.some((i) => i.reason_summary.includes('复核'))" class="batch-btn" @click="archiveAll">
            批量确认
          </button>
        </div>
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="error-item"
          @click="viewDetail(item)"
        >
          <div class="error-item__main">
            <div class="error-item__subject">{{ item.subject }}</div>
            <div class="error-item__knowledge cuoti-ellipsis">{{ item.knowledge_point }}</div>
            <div class="error-item__reason">{{ item.reason_summary }}</div>
            <div class="error-item__footer">
              <span class="error-item__time">
                <el-icon><Calendar /></el-icon>
                {{ fmtDate(item.archived_at) }}
              </span>
              <button
                v-if="item.reason_summary.includes('复核')"
                class="confirm-btn"
                @click.stop="confirmArchive(item)"
              >
                确认归档
              </button>
            </div>
          </div>
          <el-icon class="error-item__arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 错题详情 -->
    <div v-else class="error-detail">
      <button class="back-btn" @click="closeDetail">
        <!-- 返回图标 -->
        ← 返回列表
      </button>
      <div class="detail-section">
        <div class="detail-label">科目 / 知识点</div>
        <div class="detail-value">
          <span class="subject-tag">{{ selectedDetail.subject }}</span>
          {{ selectedDetail.knowledge_point }}
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-label">原题</div>
        <div class="detail-value">{{ selectedDetail.question_snapshot }}</div>
      </div>
      <div class="detail-section two-col">
        <div>
          <div class="detail-label">你的答案</div>
          <div class="detail-value user">{{ selectedDetail.student_answer }}</div>
        </div>
        <div>
          <div class="detail-label">正确答案</div>
          <div class="detail-value correct">{{ selectedDetail.standard_answer }}</div>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-label">错因分析</div>
        <div class="detail-value">{{ selectedDetail.reason_summary }}</div>
      </div>
      <div class="detail-section">
        <div class="detail-label">归档时间</div>
        <div class="detail-value">{{ fmtDate(selectedDetail.archived_at) }}</div>
      </div>
      <button
        v-if="selectedDetail.status === 'review'"
        class="detail-confirm-btn"
        @click="confirmArchive(selectedDetail); closeDetail()"
      >
        确认归档到错题本
      </button>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.error-book {
  height: 100%;
}

.filter-bar {
  margin-bottom: 16px;

  .filter-label {
    @include flex-center;
    justify-content: flex-start;
    gap: 6px;
    font-size: 12px;
    color: var(--cuoti-text-secondary);
    margin-bottom: 8px;
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-tag {
    padding: 5px 12px;
    border: 1px solid var(--cuoti-border);
    border-radius: var(--cuoti-radius-full);
    background: var(--cuoti-bg-card);
    color: var(--cuoti-text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--cuoti-transition-fast);

    &.active {
      background: var(--cuoti-primary);
      color: #fff;
      border-color: var(--cuoti-primary);
    }

    &:not(.active):hover {
      border-color: var(--cuoti-primary);
      color: var(--cuoti-primary);
    }
  }
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: var(--cuoti-text-tertiary);

  &__icon {
    font-size: 44px;
  }

  &__text {
    font-size: 15px;
    margin-top: 12px;
    color: var(--cuoti-text-secondary);
  }

  &__sub {
    font-size: 12px;
    margin-top: 6px;
  }
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-header {
  @include flex-between;
  font-size: 12px;
  color: var(--cuoti-text-tertiary);
  margin-bottom: 4px;

  .batch-btn {
    padding: 4px 10px;
    border: 1px solid var(--cuoti-primary);
    border-radius: var(--cuoti-radius-full);
    background: transparent;
    color: var(--cuoti-primary);
    font-size: 11px;
    cursor: pointer;

    &:hover {
      background: var(--cuoti-primary);
      color: #fff;
    }
  }
}

.error-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--cuoti-divider);
  border-radius: var(--cuoti-radius-md);
  background: var(--cuoti-bg-app);
  cursor: pointer;
  transition: all var(--cuoti-transition-fast);

  &:hover {
    border-color: var(--cuoti-primary);
    background: var(--cuoti-primary-soft);
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__subject {
    font-size: 11px;
    color: var(--cuoti-primary);
    font-weight: 600;
    width: fit-content;
  }

  &__knowledge {
    font-size: 15px;
    font-weight: 600;
    color: var(--cuoti-text-primary);
  }

  &__reason {
    font-size: 13px;
    color: var(--cuoti-text-secondary);
    line-height: 1.4;
  }

  &__footer {
    @include flex-between;
    margin-top: 2px;
  }

  &__time {
    @include flex-center;
    justify-content: flex-start;
    gap: 4px;
    font-size: 12px;
    color: var(--cuoti-text-tertiary);
  }

  &__arrow {
    color: var(--cuoti-text-tertiary);
    font-size: 16px;
  }
}

.confirm-btn {
  padding: 4px 10px;
  border: 1px solid var(--cuoti-primary);
  border-radius: var(--cuoti-radius-full);
  background: transparent;
  color: var(--cuoti-primary);
  font-size: 11px;
  cursor: pointer;
  transition: all var(--cuoti-transition-fast);

  &:hover {
    background: var(--cuoti-primary);
    color: #fff;
  }
}

.error-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.back-btn {
  @include flex-center;
  justify-content: flex-start;
  gap: 6px;
  padding: 8px 0;
  border: none;
  background: transparent;
  color: var(--cuoti-text-secondary);
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: var(--cuoti-primary);
  }
}

.detail-section {
  .detail-label {
    font-size: 12px;
    color: var(--cuoti-text-tertiary);
    margin-bottom: 6px;
  }

  .detail-value {
    font-size: 14px;
    color: var(--cuoti-text-primary);
    line-height: 1.6;

    &.user {
      color: var(--cuoti-danger);
      font-weight: 600;
    }

    &.correct {
      color: var(--cuoti-success);
      font-weight: 600;
    }
  }

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

.subject-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--cuoti-radius-full);
  background: var(--cuoti-primary-soft);
  color: var(--cuoti-primary);
  font-size: 11px;
  font-weight: 600;
  margin-right: 8px;
}

.detail-confirm-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--cuoti-radius-md);
  background: var(--cuoti-primary-gradient);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.92;
  }
}
</style>
