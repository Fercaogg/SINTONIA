// Estado compartido de la portada: el desfase entre las dos miradas de la
// demostración (0 = en sintonía, 1 = máximo desacuerdo). Lo escribe la
// demostración y lo leen las ondas y el campo de fondo del inicio.
import { ref } from 'vue'

export const desfasePortada = ref(0.5)
