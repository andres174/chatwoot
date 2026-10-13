<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { isSafeHttpLink } from 'shared/helpers/documentHelper';

const props = defineProps({
  referral: { type: Object, required: true },
});

const { t } = useI18n();

const imageFailed = ref(false);

const imageSrc = computed(
  () => props.referral.imageUrl || props.referral.thumbnailUrl
);

const sourceUrl = computed(() =>
  isSafeHttpLink(props.referral.sourceUrl) ? props.referral.sourceUrl : null
);

const label = computed(() =>
  props.referral.sourceType === 'post'
    ? t('CONVERSATION.AD_REFERRAL.LABEL_POST')
    : t('CONVERSATION.AD_REFERRAL.LABEL_AD')
);
</script>

<template>
  <div class="flex gap-2 p-2 -mx-1 mb-2 rounded-lg bg-n-alpha-black1">
    <img
      v-if="imageSrc && !imageFailed"
      :src="imageSrc"
      :alt="referral.headline"
      class="w-16 h-16 object-cover rounded-md flex-shrink-0"
      @error="imageFailed = true"
    />
    <div class="flex flex-col gap-0.5 min-w-0">
      <span class="text-xs text-n-slate-11">{{ label }}</span>
      <span v-if="referral.headline" class="font-medium line-clamp-2">
        {{ referral.headline }}
      </span>
      <span v-if="referral.body" class="text-n-slate-11 line-clamp-3">
        {{ referral.body }}
      </span>
      <a
        v-if="sourceUrl"
        :href="sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-n-blue-11 hover:underline"
      >
        {{ t('CONVERSATION.AD_REFERRAL.VIEW_AD') }}
      </a>
      <span v-if="referral.sourceId" class="text-xs text-n-slate-11">
        {{ t('CONVERSATION.AD_REFERRAL.AD_ID', { id: referral.sourceId }) }}
      </span>
    </div>
  </div>
</template>
