import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateOSTraining() {
  console.log('Fetching OS role ID...')

  // Get the OS role ID
  const { data: roleData, error: roleError } = await supabase
    .from('training_roles')
    .select('id')
    .eq('short_code', 'OS')
    .single()

  if (roleError || !roleData) {
    console.error('Could not find OS role:', roleError)
    return
  }

  const osRoleId = roleData.id
  console.log('OS Role ID:', osRoleId)

  console.log('Deleting existing OS modules (Day 3+)...')

  // Delete existing OS-specific modules (keep common Day 1-2 modules)
  const { error: deleteError } = await supabase
    .from('training_modules')
    .delete()
    .eq('role_id', osRoleId)
    .gte('day', 3)

  if (deleteError) {
    console.error('Delete error:', deleteError)
    return
  }

  // Delete existing OS resources for Day 3+
  const { error: deleteResourcesError } = await supabase
    .from('training_resources')
    .delete()
    .eq('role_id', osRoleId)
    .gte('day', 3)

  if (deleteResourcesError) {
    console.error('Delete resources error:', deleteResourcesError)
  }

  console.log('Inserting new OS modules (Day 3-5)...')

  const modules = [
    // Day 3
    { role_id: osRoleId, day: 3, start_time: '09:30am', end_time: '11:30am', duration_hours: 2, topic: 'Advanced System & Features', details: 'Reports, CSVs, promotions, price books and more. Go deeper into advanced features like QR Order & Pay, Beep Delivery, Membership, Engage, and think about how they solve real merchant problems.\n\nSuccess Criteria: Complete task within the hour and move on to Advanced Troubleshooting.', type: 'Self-Study', resource_url: 'https://storehub.sg.larksuite.com/wiki/Q6dkwGUhhiRNrKkPAY0l37KYgig', is_common: false, sort_order: 1 },
    { role_id: osRoleId, day: 3, start_time: '11:30am', end_time: '1:00pm', duration_hours: 1.5, topic: 'Advanced Troubleshooting', details: 'IP addresses, feed tests, printer resets. Self-study the basics of networking and printer troubleshooting, and understand how each step helps get operations back on track.\n\nSuccess Criteria: Complete task within the hour and move on to Quiz.', type: 'Self-Study', resource_url: 'https://storehub.sg.larksuite.com/wiki/BV67wlB0Yic2B7k83Y4le3VigIe', is_common: false, sort_order: 2 },
    { role_id: osRoleId, day: 3, start_time: '1:00pm', end_time: '2:00pm', duration_hours: 1, topic: 'Lunch', details: null, type: 'Break', resource_url: null, is_common: false, sort_order: 3 },
    { role_id: osRoleId, day: 3, start_time: '2:00pm', end_time: '3:00pm', duration_hours: 1, topic: 'Advanced System: Quiz Time!', details: 'Complete 35 questions. Achieve a minimal score of 80%, there will be no retake. Use slides as reference as this is an open book test.\n\nSuccess Criteria: Minimum passing rate is 80%', type: 'Assessment', resource_url: 'https://forms.gle/uD9B6vzsxxvhxoFt9', is_common: false, sort_order: 4 },
    { role_id: osRoleId, day: 3, start_time: '3:00pm', end_time: '3:30pm', duration_hours: 0.5, topic: 'Sync Up!', details: 'This is a chance to tell your trainer if you have any confusion. Your trainer will recap topics, conduct a product demo, and discuss quiz questions.\n\nP.S.: Do not submit the quiz form until you\'ve discussed with trainer.', type: 'Trainer-Led', resource_url: null, is_common: false, sort_order: 5 },
    { role_id: osRoleId, day: 3, start_time: '3:30pm', end_time: '4:30pm', duration_hours: 1, topic: 'Hardware Assessment', details: 'Assemble hardware, search for printers, run feed tests, reset and configure devices, and troubleshoot IP issues.\n\nSuccess Criteria: Minimum passing rate is 80%', type: 'Assessment', resource_url: 'https://forms.gle/4uqyPthsVweeZPqx6', is_common: false, sort_order: 6 },
    { role_id: osRoleId, day: 3, start_time: '4:30pm', end_time: '5:30pm', duration_hours: 1, topic: 'Tools & Supply Chain', details: 'Intercom, Aircall, supply chain processes. Learn how to use them to help merchants faster, solve problems smarter, and keep operations running smoothly.\n\nSuccess Criteria: Complete task within the hour and move on to Brand Servicing', type: 'Self-Study', resource_url: 'https://storehub.sg.larksuite.com/wiki/XptXwmBv1iC3MqkQBUnlyaBjgkb', is_common: false, sort_order: 7 },
    { role_id: osRoleId, day: 3, start_time: '5:30pm', end_time: '6:30pm', duration_hours: 1, topic: 'Brand Servicing', details: 'Communication, empathy, patience. Master these to turn every interaction into a positive experience.\n\nSuccess Criteria: Complete task within the hour.', type: 'Self-Study', resource_url: 'https://storehub.sg.larksuite.com/wiki/Ug1Kw52ROiPFy6kQVbRlyLAKg6b', is_common: false, sort_order: 8 },

    // Day 4
    { role_id: osRoleId, day: 4, start_time: '09:30am', end_time: '10:30am', duration_hours: 1, topic: 'Buddy Session with Onboarding Coordinator', details: 'Learn menu setup from senior OCs, take notes in the Buddy Checklist. Ask questions, observe their processes, and document everything you learn.\n\nP.S.: Ensure that you\'ve already sent invitations to your Buddy.', type: 'Buddy Session', resource_url: 'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc', is_common: false, sort_order: 1 },
    { role_id: osRoleId, day: 4, start_time: '10:30am', end_time: '1:00pm', duration_hours: 2.5, topic: 'Menu Setup!', details: 'Get hands-on experience with menu setup. Open merchant tickets, review their menus, and create at least 20 products each for F&B and Retail using your BackOffice account.', type: 'Self-Study', resource_url: 'F&B Ticket: https://app.intercom.com/a/inbox/v2axofpf/inbox/conversation/189972000831621?view=List\nRetail Ticket: https://app.intercom.com/a/inbox/v2axofpf/inbox/conversation/189972000848166?view=List', is_common: false, sort_order: 2 },
    { role_id: osRoleId, day: 4, start_time: '1:00pm', end_time: '2:00pm', duration_hours: 1, topic: 'Lunch', details: null, type: 'Break', resource_url: null, is_common: false, sort_order: 3 },
    { role_id: osRoleId, day: 4, start_time: '2:00pm', end_time: '4:30pm', duration_hours: 2.5, topic: 'Training Slides & Assessment Preparation', details: 'Immerse yourself in the training deck that you\'ll use to guide merchants. Watch video samples of seniors in action and take notes.\n\nPro Tip: Play videos at higher speed or skip to key sections.', type: 'Self-Study', resource_url: 'Training Checklist: https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh', is_common: false, sort_order: 4 },
    { role_id: osRoleId, day: 4, start_time: '4:30pm', end_time: '6:30pm', duration_hours: 2, topic: 'Buddy Session with Onboarding Specialist', details: 'Learn directly from senior OSs. Ask questions, observe their workflows, and document everything in the Buddy Checklist.\n\nP.S.: Ensure that you\'ve already sent invitations to your Buddy.', type: 'Buddy Session', resource_url: 'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc', is_common: false, sort_order: 5 },

    // Day 5
    { role_id: osRoleId, day: 5, start_time: '9:30am', end_time: '10:30am', duration_hours: 1, topic: 'Training Video Assessment (F&B)', details: 'The time has come! Show us what you got.\n\nSuccess Criteria: Passing rate of 80%', type: 'Coach Review', resource_url: 'Training Checklist: https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh\nScorecard: https://forms.gle/PoWWciHpStBQyoy2A', is_common: false, sort_order: 1 },
    { role_id: osRoleId, day: 5, start_time: '10:30am', end_time: '11:00am', duration_hours: 0.5, topic: 'Self Reflect', details: 'Reflect from previous assessment and apply improvement on Retail Assessment.', type: 'Self-Study', resource_url: null, is_common: false, sort_order: 2 },
    { role_id: osRoleId, day: 5, start_time: '11:00am', end_time: '12:00pm', duration_hours: 1, topic: 'Training Video Assessment (Retail)', details: 'The time has come! Show us what you got.\n\nSuccess Criteria: Passing rate of 80%', type: 'Coach Review', resource_url: 'Training Checklist: https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh\nScorecard: https://forms.gle/NLz3fTGEzrtig3qz9', is_common: false, sort_order: 3 },
    { role_id: osRoleId, day: 5, start_time: '1:00pm', end_time: '2:00pm', duration_hours: 1, topic: 'Lunch', details: null, type: 'Break', resource_url: null, is_common: false, sort_order: 4 },
    { role_id: osRoleId, day: 5, start_time: '2:00pm', end_time: '3:00pm', duration_hours: 1, topic: 'Buddy Session with Merchant Onboarding Manager', details: 'Learn from senior MOMs. Ask questions, observe their workflows, and document everything in the Buddy Checklist.\n\nP.S.: Ensure that you\'ve already sent invitations to your Buddy.', type: 'Buddy Session', resource_url: 'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc', is_common: false, sort_order: 5 },
    { role_id: osRoleId, day: 5, start_time: '3:00pm', end_time: '3:30pm', duration_hours: 0.5, topic: 'Mock Test Brief', details: 'Final Stage: Your coach will share the topics for the Mock Test. A ticket will be assigned to you one day prior for preparation.', type: 'Trainer-Led', resource_url: null, is_common: false, sort_order: 6 },
    { role_id: osRoleId, day: 5, start_time: '3:30pm', end_time: '4:30pm', duration_hours: 1, topic: 'Training Mock Test (F&B)', details: 'Full mock test simulating real training scenarios. Stay calm, confident, and focus on both technical accuracy and delivering an excellent experience.\n\nSuccess Criteria: Passing rate of 80%', type: 'Coach Review', resource_url: 'Scorecard: https://forms.gle/CcfmMcrb48cj6iMx6', is_common: false, sort_order: 7 },
    { role_id: osRoleId, day: 5, start_time: '4:30pm', end_time: '5:00pm', duration_hours: 0.5, topic: 'Self Reflect', details: 'Reflect from previous assessment and apply improvement on Retail Assessment.', type: 'Self-Study', resource_url: null, is_common: false, sort_order: 8 },
    { role_id: osRoleId, day: 5, start_time: '5:00pm', end_time: '6:00pm', duration_hours: 1, topic: 'Training Mock Test (Retail)', details: 'Full mock test simulating real training scenarios. Stay calm, confident, and focus on both technical accuracy and delivering an excellent experience.\n\nSuccess Criteria: Passing rate of 80%', type: 'Coach Review', resource_url: 'Scorecard: https://forms.gle/F5SaX7CURqrNoEV66', is_common: false, sort_order: 9 },
    { role_id: osRoleId, day: 5, start_time: '6:00pm', end_time: '6:30pm', duration_hours: 0.5, topic: 'Feedback Session with Coach', details: 'Great job! You have reached the finishing line. Your coach will advise you on next steps and provide your certificate.', type: 'Coach Review', resource_url: null, is_common: false, sort_order: 10 },
  ]

  const { data, error: insertError } = await supabase
    .from('training_modules')
    .insert(modules)
    .select()

  if (insertError) {
    console.error('Insert error:', insertError)
    return
  }

  console.log(`Successfully inserted ${data?.length} OS modules (Day 3-5)!`)

  // Insert video resources for Day 4 - Training Slides activity
  console.log('Adding video resources for Day 4...')

  // Note: Add region column first with: ALTER TABLE training_resources ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'ALL';
  // For now, we'll add titles with region prefix for clarity
  const videoResources = [
    // Training Decks
    { role_id: osRoleId, day: 4, title: 'F&B Training Deck', file_type: 'slides', url: 'https://docs.google.com/presentation/d/1U-dwU-kC8l-pJ211sBoQQS4jexhtpNCpcqE-4EEjbys/edit#slide=id.g26b7f38cc86_0_2118' },

    // MY Videos
    { role_id: osRoleId, day: 4, title: '[MY] Retail BackOffice Training', file_type: 'video', url: 'https://drive.google.com/file/d/12cW2Y_KCrX-mCLtVJxh-jKNEQMoZMjpS/view' },
    { role_id: osRoleId, day: 4, title: '[MY] Retail POS Training', file_type: 'video', url: 'https://drive.google.com/file/d/12rmHgBFt5RjwTRfLE972Crf1a5f57k_f/view' },
    { role_id: osRoleId, day: 4, title: '[MY] F&B BackOffice + POS + QR Order', file_type: 'video', url: 'https://drive.google.com/file/d/1QTENB88GpZKnxoirVeIpXZ-f2M1atCF6/view' },
    { role_id: osRoleId, day: 4, title: '[MY] F&B with Membership & Engage', file_type: 'video', url: 'https://drive.google.com/file/d/1vxGqxzoI9xYmSWMM0YPh88ounb-HBLFB/view' },
    { role_id: osRoleId, day: 4, title: '[MY] Training Video (CN)', file_type: 'video', url: 'https://drive.google.com/file/d/1d9gq2OuoJ1O-F4y_L6cqnzBWhy-gFNnm/view' },
    { role_id: osRoleId, day: 4, title: '[MY] Training Video (EN)', file_type: 'video', url: 'https://drive.google.com/file/d/1K6lZwYw7boYQL9fosVuXyHtJ5ZNEubfa/view' },

    // PH Resources
    { role_id: osRoleId, day: 4, title: '[PH] Training Deck Folder', file_type: 'folder', url: 'https://drive.google.com/drive/u/0/folders/15-2zwWipbj7SbQnfXfrd_e8WzVFwuqWo' },
    { role_id: osRoleId, day: 4, title: '[PH] Training Video', file_type: 'video', url: 'https://drive.google.com/file/d/1SuqdeUOpVQwzIwh0OeK65hVpMlksBWyZ/view' },
  ]

  const { data: resourceData, error: resourceError } = await supabase
    .from('training_resources')
    .insert(videoResources)
    .select()

  if (resourceError) {
    console.error('Resource insert error:', resourceError)
  } else {
    console.log(`Added ${resourceData?.length} video resources for Day 4!`)
  }

  // Update training_roles to ensure 5 days
  const { error: updateError } = await supabase
    .from('training_roles')
    .update({ total_days: 5 })
    .eq('short_code', 'OS')

  if (updateError) {
    console.error('Update role error:', updateError)
  } else {
    console.log('Updated OS role to 5 days')
  }

  console.log('Done!')
}

updateOSTraining()
