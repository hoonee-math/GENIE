<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
        @click.self="closeModal"
    >
        <div
            class="bg-white p-[22px] md:rounded-xl text-center relative flex flex-col items-center justify-center md:border md:border-[#757575] gap-9 max-w-[1232px] max-h-[968px]"
            :style="modalStyle"
        >
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    isOpen: Boolean,
    width: { type: String, default: "350px" },
    height: { type: String, default: "auto" },
    maxWidth: { type: String, default: "1232px" },
    maxHeight: { type: String, default: "968px" },
});

const emit = defineEmits(["close"]);

const closeModal = () => {
    emit("close");
};

const modalStyle = computed(() => ({
    width: props.width,
    height: props.height,
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight,
}));
</script>
