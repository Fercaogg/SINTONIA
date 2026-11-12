# =============================================================================
# SINTONÍA · Script de ejemplo para el análisis
#
# PLANTILLA para empezar el análisis, no un análisis definitivo.
#
# Carga el CSV de investigación (una fila por pareja y semana, ver DATOS.md)
# y ajusta un modelo multinivel sencillo para el microensayo aleatorizado:
#
#   ¿Recibir la agenda una semana reduce el desajuste en el avance
#    la semana siguiente?
#
#   desajuste_siguiente ~ agenda + semana + (1 | pareja)
#
# Uso, desde la carpeta donde esté el CSV:
#   Rscript analisis_ejemplo.R sintonia_semanal.csv
# o, en RStudio, cambiando la variable "archivo" de abajo.
# =============================================================================

args <- commandArgs(trailingOnly = TRUE)
archivo <- if (length(args) >= 1) args[1] else "sintonia_semanal.csv"

if (!requireNamespace("lme4", quietly = TRUE)) {
  stop("Falta el paquete lme4. Instálalo con: install.packages(\"lme4\")")
}
library(lme4)

# -----------------------------------------------------------------------------
# 1. Carga
# -----------------------------------------------------------------------------
d <- read.csv(archivo, na.strings = "NA", stringsAsFactors = FALSE, encoding = "UTF-8")
cat("Filas cargadas:", nrow(d), "\n")
cat("Parejas:", length(unique(d$id_pareja)), "\n")
cat("Semanas:", paste(range(d$semana), collapse = " a "), "\n\n")

columnas_necesarias <- c("id_pareja", "id_tutor", "master", "semana", "est_avance", "tut_avance",
                         "dif_avance", "sorteo_elegible", "sorteo_resultado", "agenda")
faltan <- setdiff(columnas_necesarias, names(d))
if (length(faltan) > 0) stop("Faltan columnas en el CSV: ", paste(faltan, collapse = ", "))

d$id_pareja <- factor(d$id_pareja)
d$id_tutor <- factor(d$id_tutor)
d$master <- factor(d$master)

# -----------------------------------------------------------------------------
# 2. Descriptivos
# -----------------------------------------------------------------------------
cat("Tasa de respuesta por semana (estudiantes y tutores):\n")
print(aggregate(cbind(estudiante = !is.na(est_avance), tutor = !is.na(tut_avance)) ~ semana,
                data = d, FUN = mean))

elegibles <- subset(d, sorteo_elegible == 1)
cat("\nSorteos: ", nrow(elegibles), " parejas-semana elegibles; proporción con agenda = ",
    round(mean(elegibles$sorteo_resultado), 3), "\n", sep = "")

# -----------------------------------------------------------------------------
# 3. Variable de resultado: desajuste absoluto en el avance la semana siguiente
# -----------------------------------------------------------------------------
d <- d[order(d$id_pareja, d$semana), ]
d$desajuste <- abs(d$dif_avance)
siguiente <- d[, c("id_pareja", "semana", "desajuste")]
names(siguiente) <- c("id_pareja", "semana_siguiente", "desajuste_siguiente")
siguiente$semana <- siguiente$semana_siguiente - 1
d <- merge(d, siguiente[, c("id_pareja", "semana", "desajuste_siguiente")],
           by = c("id_pareja", "semana"), all.x = TRUE)

m <- subset(d, sorteo_elegible == 1 & !is.na(desajuste_siguiente))
cat("Observaciones para el modelo:", nrow(m), "(", length(unique(m$id_pareja)), "parejas )\n\n")

# -----------------------------------------------------------------------------
# 4. Modelo multinivel (intercepto aleatorio por pareja)
# -----------------------------------------------------------------------------
if (nrow(m) >= 10 && length(unique(m$id_pareja)) >= 3) {
  m$semana_c <- m$semana - mean(m$semana)
  modelo <- lmer(desajuste_siguiente ~ sorteo_resultado + semana_c + (1 | id_pareja), data = m)
  cat("Modelo multinivel: desajuste_siguiente ~ sorteo_resultado + semana_c + (1 | id_pareja)\n")
  print(summary(modelo))
  cat("\nEfecto estimado de recibir la agenda (sorteo_resultado):",
      round(fixef(modelo)[["sorteo_resultado"]], 3), "puntos de desajuste\n")
  # Para un análisis completo del microensayo aleatorizado, considera:
  # centrar por pareja, efectos aleatorios de tutor (1 | id_tutor) o máster,
  # moderación por desajuste_relevante y el tratamiento de los datos que faltan.
} else {
  cat("Aún no hay datos suficientes para ajustar el modelo.\n")
}
