-- Update Onboarding Specialist (OS) Training Modules
-- First, delete existing OS modules to replace with new ones
DELETE FROM training_modules WHERE role_code = 'OS';

-- Insert new OS training modules
INSERT INTO training_modules (role_code, day_number, activity_id, activity_title, activity_type, estimated_duration_minutes, resource_link, success_criteria, is_coach_led, display_order) VALUES

-- Day 1 (Shared with All roles)
('OS', 1, 'os-d1-1', 'Training Briefing', 'Trainer Led', 60, NULL, 'Trainee pays attention and ensure they clearly understand the expectations set for them.', true, 1),
('OS', 1, 'os-d1-2', 'All in One: Software', 'Self Study', 60, 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb', 'Complete task within the hour and move on to Hardware topic. Keep your trainer in the loop on your progress by 6:00 pm.', false, 2),
('OS', 1, 'os-d1-3', 'All in One: Hardware', 'Self Study', 60, 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb', 'Complete task within the hour and move on to Features topic. Update your trainer by 6:00 pm.', false, 3),
('OS', 1, 'os-d1-4', 'All in One: Feature', 'Self Study', 90, 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb', 'Complete task within the hour and move on to System Navigation topic. Update your trainer by 6:00 pm.', false, 4),

-- Day 2 (Shared with All roles)
('OS', 2, 'os-d2-1', 'All in One: System Navigation & BackOffice Assignment', 'Self Study', 270, 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb', 'Create a Backoffice account, complete the BackOffice checklist, and update your trainer by 6:00 pm.', false, 1),
('OS', 2, 'os-d2-2', 'Lunch', 'Break', 60, NULL, NULL, false, 2),
('OS', 2, 'os-d2-3', 'All in One: System Navigation & BackOffice Assignment (Cont)', 'Assignment', 60, 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb', 'Complete the BackOffice assignment if not finished.', false, 3),
('OS', 2, 'os-d2-4', 'Sync Up!', 'Trainer Led', 90, NULL, 'Recap topics, product demo, and discuss quiz questions.', true, 4),
('OS', 2, 'os-d2-5', 'All in One: Quiz Time!', 'Assessment', 60, 'https://forms.gle/dAiBZXvPqpfg5fjK8', 'Minimum passing rate is 80%', false, 5),
('OS', 2, 'os-d2-6', 'Role Specific Brief', 'Trainer Led', 60, NULL, 'Understand expectations for role-specific level.', true, 6),

-- Day 3 (Onboarding Specialist specific)
('OS', 3, 'os-d3-1', 'Advanced System & Features', 'Self Study', 120, 'https://storehub.sg.larksuite.com/wiki/Q6dkwGUhhiRNrKkPAY0l37KYgig', 'Complete task within the hour and move on to Advanced Troubleshooting.', false, 1),
('OS', 3, 'os-d3-2', 'Advanced Troubleshooting', 'Self Study', 90, 'https://storehub.sg.larksuite.com/wiki/BV67wlB0Yic2B7k83Y4le3VigIe', 'Complete task within the hour and move on to Quiz.', false, 2),
('OS', 3, 'os-d3-3', 'Lunch', 'Break', 60, NULL, NULL, false, 3),
('OS', 3, 'os-d3-4', 'Advanced System: Quiz Time!', 'Assessment', 60, 'https://forms.gle/uD9B6vzsxxvhxoFt9', 'Minimum passing rate is 80%', false, 4),
('OS', 3, 'os-d3-5', 'Sync Up!', 'Trainer Led', 30, NULL, 'Recap topics, product demo, and discuss quiz questions.', true, 5),
('OS', 3, 'os-d3-6', 'Hardware Assessment', 'Trainer Led', 60, 'https://forms.gle/4uqyPthsVweeZPqx6', 'Minimum passing rate is 80%', true, 6),
('OS', 3, 'os-d3-7', 'Tools & Supply Chain', 'Self Study', 60, 'https://storehub.sg.larksuite.com/wiki/XptXwmBv1iC3MqkQBUnlyaBjgkb', 'Complete task within the hour and move on to Brand Servicing.', false, 7),
('OS', 3, 'os-d3-8', 'Brand Servicing', 'Self Study', 60, 'https://storehub.sg.larksuite.com/wiki/Ug1Kw52ROiPFy6kQVbRlyLAKg6b', 'Complete task within the hour.', false, 8),

-- Day 4 (Onboarding Specialist specific)
('OS', 4, 'os-d4-1', 'Buddy Session with Onboarding Coordinator', 'Buddy Led', 60, 'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc', 'Learn menu setup, take notes in the Buddy Checklist.', false, 1),
('OS', 4, 'os-d4-2', 'Menu Setup!', 'Assignment', 150, 'https://app.intercom.com/a/inbox/v2axofpf/inbox/conversation/189972000831621?view=List', 'Create at least 20 products each for F&B and Retail.', false, 2),
('OS', 4, 'os-d4-3', 'Lunch', 'Break', 60, NULL, NULL, false, 3),
('OS', 4, 'os-d4-4', 'Training Slides & Assessment Preparation', 'Self Study', 150, 'https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh', 'Study training deck and prepare for mock assessments.', false, 4),
('OS', 4, 'os-d4-5', 'Buddy Session with Onboarding Specialist', 'Buddy Led', 120, 'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc', 'Learn from senior OS, take notes in the Buddy Checklist.', false, 5),

-- Day 5 (Onboarding Specialist specific)
('OS', 5, 'os-d5-1', 'Training Video Assessment (F&B)', 'Coach Led', 60, 'https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh', 'Passing rate of 80%', true, 1),
('OS', 5, 'os-d5-2', 'Self Reflect', 'Self Study', 30, NULL, 'Reflect from previous assessment and apply improvement on Retail Assessment.', false, 2),
('OS', 5, 'os-d5-3', 'Training Video Assessment (Retail)', 'Coach Led', 60, 'https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh', 'Passing rate of 80%', true, 3),
('OS', 5, 'os-d5-4', 'Lunch', 'Break', 60, NULL, NULL, false, 4),
('OS', 5, 'os-d5-5', 'Buddy Session with Merchant Onboarding Manager', 'Buddy Led', 60, 'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc', 'Learn from senior MOM, take notes in the Buddy Checklist.', false, 5),
('OS', 5, 'os-d5-6', 'Mock Test Brief', 'Trainer Led', 30, NULL, 'Coach will share topics for Mock Test.', true, 6),
('OS', 5, 'os-d5-7', 'Training Mock Test (F&B)', 'Coach Led', 60, 'https://forms.gle/CcfmMcrb48cj6iMx6', 'Passing rate of 80%', true, 7),
('OS', 5, 'os-d5-8', 'Self Reflect', 'Self Study', 30, NULL, 'Reflect from previous assessment and apply improvement on Retail Assessment.', false, 8),
('OS', 5, 'os-d5-9', 'Training Mock Test (Retail)', 'Coach Led', 60, 'https://forms.gle/F5SaX7CURqrNoEV66', 'Passing rate of 80%', true, 9),
('OS', 5, 'os-d5-10', 'Feedback Session with Coach', 'Coach Led', 30, NULL, 'Coach will advise on next steps and provide certificate.', true, 10);

-- Update training_roles table if needed
UPDATE training_roles SET total_days = 5 WHERE role_code = 'OS';
