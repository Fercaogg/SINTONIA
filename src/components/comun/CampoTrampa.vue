<script setup lang="ts">
// Campo trampa contra programas que rellenan formularios: invisible y fuera
// del orden del teclado, así que las personas nunca lo rellenan. Si llega
// relleno, el servidor descarta el envío en silencio.
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [valor: string] }>()
</script>

<template>
  <div class="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
    <label for="sitio-web">No rellenes este campo</label>
    <input
      id="sitio-web"
      :value="modelValue"
      type="text"
      name="sitio"
      tabindex="-1"
      autocomplete="off"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
