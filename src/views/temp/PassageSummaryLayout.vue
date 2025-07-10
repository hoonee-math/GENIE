<template>
  <div class="flex flex-col items-start p-0 w-full lg:max-w-[35%]">
    <div class="flex flex-col items-start p-0 gap-4 w-full">
      <p
        class="font-pretendard font-bold text-2xl md:text-xl leading-[150%] tracking-[-0.02em] text-[#303030]"
      >
        지문 분석
      </p>
      <div
        class="box-border flex flex-col items-start px-6 md:px-8 lg:px-10 py-4 gap-4 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm"
      >
        <div class="flex flex-row items-center gap-4 w-full">
          <p
            class="font-pretendard font-bold text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] min-w-[80px]"
          >
            지문 분야
          </p>
          <p
            class="font-pretendard font-normal text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] break-words flex-1"
          >
            
            <slot name="subject" />
          </p>
        </div>
        <div class="flex flex-row items-start gap-4 w-full">
          <p
            class="font-pretendard font-bold text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] min-w-[80px] shrink-0"
          >
            지문 제재
          </p>
          <div class="flex-1 min-w-0">
            <p
              class="font-pretendard font-normal text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] break-words whitespace-pre-wrap overflow-hidden"
            >
              
                <slot name="keyword" />
            </p>
          </div>
        </div>
        
        <div class="flex flex-col items-start gap-4 w-full flex-1">
        <p
            class="font-pretendard font-bold text-sm md:text-base leading-[150%] tracking-[-0.02em] text-[#303030] min-w-[80px] shrink-0"
        >
            핵심 논점
        </p>
            <div
            class="w-full font-pretendard font-normal text-sm md:text-base leading-[200%] tracking-[-0.02em] text-[#303030]"
            >
                <slot name="gistText" />
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
</script>
