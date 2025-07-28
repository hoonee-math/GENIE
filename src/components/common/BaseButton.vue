<template>
    <button
        :class="[
            'px-3 py-2 rounded-[6.46px] text-sm font-bold leading-[30px] border cursor-pointer transition-all duration-200 flex items-center justify-center tracking-[-0.02em]',
            buttonTypeClass,
            { 'opacity-50 cursor-not-allowed': disabled },
        ]"
        :disabled="disabled"
        @mouseover="hover = true"
        @mouseleave="hover = false"
    >
        <!-- @click="handleClick" -->
        {{ text }}
    </button>
</template>

<script>
export default {
    props: {
        text: { type: String, default: "Button" }, // 버튼 텍스트
        type: { type: String, default: "type1" }, // 버튼 스타일
        disabled: { type: Boolean, default: false }, // 비활성화 여부
    },
    data() {
        return {
            hover: false,
        };
    },
    computed: {
        buttonTypeClass() {
            const baseClasses = {
                type1: "bg-[#0086ff] text-white hover:bg-[#03447e] disabled:bg-[#7fc7ff] hover:shadow-xl active:scale-[0.98] hover:-translate-y-0.3",
                type2: "bg-[#0086ff] text-white hover:bg-[#03447e] disabled:bg-[#7fc7ff] hover:shadow-xl active:scale-[0.98] hover:-translate-y-0.3",
                type3: "bg-white border border-[#bdbdbd] text-[#757575] hover:border-[#0086ff] hover:text-[#0086ff] disabled:border-[#7fc7ff] disabled:text-[#757575]",
                type4: "bg-white border border-[#bdbdbd] text-[#757575] hover:border-[#0086ff] hover:text-[#0086ff] disabled:border-[#7fc7ff] disabled:text-[#757575]",
                type5: "bg-white border border-[#bdbdbd] text-[#303030] hover:border-[#0086ff] hover:text-[#0086ff] disabled:border-[#7fc7ff] disabled:text-[#757575]",
            };
            return baseClasses[this.type] || baseClasses.type1;
        },
    },
    methods: {
        // handleClick(event) {
        //     if (!this.disabled) this.$emit("click", event);
        // },
    },
};
</script>
