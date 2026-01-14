export interface Assessment {
  name: string
  role: string
  scheduleDay: number
  formLink: string
  instructions: string
  weightage: number
}

export interface AssessmentNotification {
  traineeName: string
  traineeEmail: string
  assessmentName: string
  coachName: string
  coachEmail: string
  trainingDay: number
  dateSent: string
  status: string
}
