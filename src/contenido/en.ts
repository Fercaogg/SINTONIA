// English version of the public content (Phase 5). Same shape as the Spanish
// files, so components can use either. Only translations of what is already
// published in Spanish: nothing new is claimed here.
//
// Terms: "tutor/a" → "supervisor"; "TFM" → "Master's thesis"; "dirección del
// máster" → "programme directors"; institutional names stay in Spanish.
import type { Perfil } from './portada'

export const DATOS_CLAVE = [
  { cifra: '60', unidad: 's', texto: 'a week for the student' },
  { cifra: '30', unidad: 's', texto: 'a week for the supervisor, for all their students' },
  { cifra: '3', unidad: 'questions', texto: 'neutral ones for the meeting, when the draw selects them' },
  { cifra: '5', unidad: 'people', texto: 'at least, before programme directors see any figure' },
] as const

export const PASOS = [
  {
    titulo: 'One minute a week',
    texto: 'Student and supervisor separately answer a few questions about how the work is going.',
    detalle: 'The student answers four questions from 1 to 5 (one of them, about their wellbeing, is only seen by them). The supervisor answers one or two per student.',
    icono: 'checkin',
  },
  {
    titulo: 'Two perspectives',
    texto: 'SINTONÍA compares the answers using simple, public rules. No marks, no rankings.',
    detalle: 'There is a mismatch if the difference is 2 points or more, or 1 point in the same direction two weeks in a row. Nobody is right: they are two perspectives.',
    icono: 'compare',
  },
  {
    titulo: 'Three questions for the meeting',
    texto: 'If the perspectives do not match, both receive the same three neutral questions to talk it through.',
    detalle: 'Each week, a draw (probability 0.5) decides which pairs receive them. It is part of the study: it shows whether the questions help.',
    icono: 'chat',
  },
] as const

export const PERFILES: Perfil[] = [
  {
    clave: 'estudiante',
    nombre: 'Student',
    tiempo: 'About 60 seconds a week',
    hace: [
      'Answers four questions from 1 to 5: progress, next step, perceived support and wellbeing.',
      'If they want, turns on the Bridge to the PhD and adds dates to their calendar.',
      'If they need to, presses "I need support" to alert the programme directors.',
    ],
    ve: ['Their own answers and history.', 'The meeting agenda, when the draw selects them.'],
    noVe: ["Their supervisor's answers.", "Other students' data."],
  },
  {
    clave: 'tutor',
    nombre: 'Supervisor',
    tiempo: 'About 30 seconds a week, for all their students',
    hace: ['Answers, for each student, how they see the progress and, optionally, the next step.', 'Receives the same agenda as their student when the draw selects them.'],
    ve: ['Their own answers.', "Their students' names and each pair's agenda."],
    noVe: ["Their students' answers.", "Anyone's wellbeing.", "Other supervisors' data."],
  },
  {
    clave: 'direccion',
    nombre: 'Programme directors',
    tiempo: 'Whenever they want to check',
    hace: ['Look at programme figures, such as the response rate.', 'Receive "I need support" alerts, with the name only if the student allows it.'],
    ve: ['Aggregated data, calculated over 5 people or more.'],
    noVe: ['Any individual answer.', "Anyone's wellbeing.", 'Any figure calculated over fewer than 5 people.'],
  },
]

export const PARA_QUIEN = [
  { titulo: "Master's programmes", texto: "To support the Master's thesis. This is where the pilot will take place." },
  { titulo: 'PhD programmes', texto: 'For the relationship between PhD candidate and thesis director. The interface adapts its terms.' },
  { titulo: 'Undergraduate final projects', texto: 'For the final degree project, with the same two-perspective logic.' },
  { titulo: 'Doctoral schools', texto: "To connect Master's graduates with information about doing a PhD." },
] as const

export const PREGUNTAS = [
  { pregunta: 'Do I have to upload my work?', respuesta: 'No. SINTONÍA does not receive, read or store any of your work: only answers from 1 to 5.' },
  {
    pregunta: 'Does my supervisor see everything?',
    respuesta: 'No. Your supervisor does not see your answers or your wellbeing. They only see their own answers and, when the draw selects you, the same agenda as you.',
  },
  {
    pregunta: 'Does it count towards my mark?',
    respuesta: 'SINTONÍA does not give marks or send anything to assessment, and your supervisor does not have your answers. The written commitment will be in the informed consent.',
    pendiente: true,
  },
  {
    pregunta: 'What does the writing program do?',
    respuesta:
      'If it is turned on, it drafts the three agenda questions. It only receives which question does not match, in which direction and by how much: never names, emails or any other personal data. It does not read work, does not mark and does not infer emotions (Article 5.1.f of Regulation (EU) 2024/1689). If it is not available, pre-written questions are used.',
  },
  { pregunta: 'Can I leave?', respuesta: 'Yes, whenever you want and without giving reasons. From My account you can withdraw from the study, download your data and delete your account.' },
  { pregunta: 'Where is my data?', respuesta: 'On servers in the European Union (Frankfurt, Germany). Wellbeing answers are stored encrypted.' },
  { pregunta: 'How much time does it take?', respuesta: 'About 60 seconds a week if you are a student, and about 30 seconds for all your students if you are a supervisor.' },
] as const

export const AUTOR = "Author: Fernando Martín Vaquero, Máster en Estudios de la Ciencia, la Tecnología y la Innovación (Master's in Science, Technology and Innovation Studies), Universidad de Salamanca."
export const ANTECEDENTE = 'WORKWELL360, final degree project in Education (Pedagogía), piloted at YMCA Salamanca.'

export const PUENTE = [
  { titulo: 'You turn it on', texto: 'The student turns on the Bridge in their dashboard whenever they want, and turns it off just as easily.' },
  { titulo: 'A deadline is coming', texto: 'When a predoctoral or PhD admission call opens or closes soon, SINTONÍA takes it into account.' },
  { titulo: 'It is discussed in the meeting', texto: 'The agenda includes a line to talk about it. It is a conversation, not an automatic alert.' },
]

// Institutions
export const PASOS_IMPLANTACION = [
  { titulo: 'Programme set-up', texto: "The programme is created in the Research dashboard. Each programme director receives a personal code to register with their university email." },
  { titulo: 'Inviting supervisors', texto: 'Each supervisor receives their own code, with an internal label and never with their name. It is for one person and expires after 30 days.' },
  { titulo: 'Codes for students', texto: 'Once the supervisors have registered, each one hands out pair codes to their students from their dashboard.' },
  { titulo: 'Calendar', texto: 'The start date, the length (10 weeks in the pilot) and the opening and closing days of each week are set. From then on, SINTONÍA opens and closes the weeks by itself.' },
] as const

export const NECESITA = [
  { icono: 'mail', titulo: 'University email', texto: 'Students, supervisors and directors sign in with their university email. The domains you specify are accepted.' },
  { icono: 'globe', titulo: 'Just a browser', texto: "Nothing to install and nothing to connect to the university's other systems. It works on phones and computers." },
  { icono: 'users', titulo: 'A contact person', texto: 'Someone from the programme team who hands out the codes to supervisors and knows the calendar.' },
  { icono: 'clock', titulo: 'One minute a week', texto: 'About 60 seconds per student and 30 per supervisor, for all their students.' },
  { icono: 'shield', titulo: 'Ethics approval, if there is research', texto: 'If the data will be used in a study, a favourable report from the relevant ethics committee is needed.' },
] as const

export const HOJA_DE_RUTA = {
  hecho: [
    'Weekly check-in for student and supervisor, on phones and computers.',
    'Comparison of the two perspectives with public rules, and an agenda of three neutral questions.',
    'Recorded weekly draw (micro-randomised trial with probability 0.5).',
    'Encrypted wellbeing, seen only by the student.',
    'Programme directors dashboard with figures only for 5 people or more.',
    '"I need support", withdrawal from the study and account deletion.',
    'Bridge to the PhD and shared calendar.',
    'Co-supervision, change of supervisor and PhD thesis terms.',
    'Initial and final questionnaires, and data export for analysis.',
    'Public demo with fictitious data.',
    'Data in the European Union (Frankfurt).',
  ],
  piloto: [
    "Pilot in two Master's programmes at the Universidad de Salamanca, with 30 to 50 pairs.",
    'Ten weeks of check-ins, with the weekly agenda draw.',
    'Questionnaire at the start and at the end.',
    'Between 8 and 10 interviews.',
  ],
  despues: [
    'Extension to undergraduate final projects, with the same two-perspective logic.',
    'Extension to PhD theses, with PhD terms already prepared.',
    "The Bridge to the PhD, to connect Master's graduates with information about doctoral studies.",
  ],
}

// Research
export const DISENO = [
  'Mixed-methods and longitudinal, over 10 weeks.',
  'A micro-randomised trial: each week, a draw with probability 0.5 decides which pairs receive the three agenda questions. This allows comparing what happens with and without them within the same pair over time (Qian et al., 2022).',
  'A questionnaire at the start (pre-test) and another at the end (post-test).',
  'Between 8 and 10 interviews.',
  'Designed to be extended to undergraduate final projects and PhD theses.',
]
export const CALENDARIO_EN: Record<string, string> = {
  'Enero de 2027': 'January 2027',
  'Febrero a abril de 2027': 'February to April 2027',
  'Mayo y junio de 2027': 'May and June 2027',
  'Piloto en dos másteres de la Universidad de Salamanca, con 30 a 50 parejas.': "Pilot in two Master's programmes at the Universidad de Salamanca, with 30 to 50 pairs.",
}
export const TEMA_HIPOTESIS_EN: Record<string, string> = {
  'Relacionada con Puente al doctorado y la orientación sobre el doctorado.': 'Related to the Bridge to the PhD and guidance about doctoral studies.',
}

/** Changelog in English (same versions and dates as src/contenido/novedades.ts). */
export const NOVEDADES_EN: Record<string, string[]> = {
  '0.5.0': ["SINTONÍA's final logo: three leaves forming an S, on the website, the browser icon and the PDF documents.", 'English version of the main public pages.'],
  '0.4.0': [
    'New pages on security, accessibility, changelog and platform status.',
    'A guided demo of about 60 seconds: the check-in, the supervisor\'s view, the mismatch and what programme directors see.',
    'Short demo clips for each profile, a calculator of the time it takes a programme and an honest comparison with other ways of supervising.',
    'A page for institutions with a demo request, a one-page PDF dossier and a public roadmap.',
    'If the form cannot send emails, it now says so clearly and offers to write with the message already prepared.',
    'A tidier research page, with "How to cite SINTONÍA" in APA 7 and a participants\' kit (information sheet, consent and FAQ) to download as PDF.',
    'The message for students who report low wellbeing links to the free psychological care service of the Universidad de Salamanca and reminds them of 112 for emergencies.',
    'The website confirms that data is stored in the European Union (Frankfurt, Germany).',
    'Public data checked against official sources: predoctoral calls and PhD regulations.',
  ],
  '0.3.0': [
    'New home page, ordered by importance, with an animated walkthrough of the product.',
    'Motion that follows scrolling and the mouse, and stops with "reduce motion".',
    'Dark mode following the system preference.',
    'Research page and sections on supervision team, profiles, FAQ and contact.',
    'Public demo with direct access to each profile and nightly reset.',
    "Redesigned app interior: this week's card, clearer headings and figures.",
    'Data region checked in the European Union.',
  ],
  '0.2.0': [
    'Safer registration and sign-in: expiring codes and attempt limits.',
    'Security headers and a strict content policy, with nothing from third parties.',
    'Privacy, legal notice, cookies and consent pages.',
    'Shared calendar for meetings, deadlines, conferences and programme events.',
    'Co-supervision, change of supervisor and terms adapted to PhD theses.',
    'Demo mode with fictitious data.',
  ],
  '0.1.0': [
    'First version: code-based sign-up, student, supervisor, programme director and research profiles.',
    'Weekly check-in for student and supervisor, with "I need support", withdrawal and account deletion.',
    'Comparison of the two perspectives, weekly draw and a three-question agenda for the meeting.',
    'Bridge to the PhD, initial and final questionnaires, and email reminders.',
    'Programme directors dashboard with figures only for 5 people or more, and data export for analysis.',
  ],
}

const MESES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export function fechaLargaEn(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  return `${d} ${MESES[m - 1]} ${a}`
}
