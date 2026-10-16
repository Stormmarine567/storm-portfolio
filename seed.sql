-- STORM portfolio seed data (generated from data/fallback.json)
-- Run after schema.sql. Safe to re-run: it clears the tables first.

truncate table public.experience_projects, public.experience, public.projects, public.skills, public.education, public.settings restart identity cascade;

insert into public.settings (id, brand_text, full_name, title, email, phone, location, github_url, linkedin_url, hero_image_url, portrait_image_url, secondary_image_url, summary, accent_color, stats, testimonials) values (
  1, 'STORM', 'Ikpotokin Miracle', 'FULL STACK DEVELOPER', 'miraclepotokin129@gmail.com', '+234 814 691 1808', 'Lagos, Nigeria', 'github.com/stormmarine567', '',
  '/assets/images/hero.svg', '/assets/images/portrait.svg', '/assets/images/workspace.svg',
  'I am a Full Stack Developer with hands-on experience building and maintaining websites and web applications using WordPress, HTML, CSS, JavaScript, PHP, and MySQL. I am skilled in building and customizing WordPress websites with custom themes, developing responsive front-end interfaces, and managing back-end logic and databases.

I am comfortable working across the full development lifecycle — from design and coding to deployment and maintenance — with a strong track record of delivering client-facing websites on schedule. I collaborate closely with designers and stakeholders to translate requirements into functional, responsive web pages.

Driven by attention to detail and a commitment to performance, I continuously debug and optimize existing codebases to improve reliability, and I stay current with best practices to deliver clean, maintainable solutions that serve real user needs.',
  'amber', '[{"value":"8+","label":"Years Experience"},{"value":"40+","label":"Projects Shipped"},{"value":"10M+","label":"API Requests / Day"},{"value":"99.9%","label":"Uptime SLA"}]'::jsonb, '[{"quote":"Marcus is one of the most reliable engineers I''ve worked with. He took our monolith and rebuilt it into a clean microservices architecture that finally let us ship without fear. Deployment frequency went up 4x in a single quarter.","name":"Sarah Mitchell","role":"VP of Engineering, CloudScale Technologies","initials":"SM"},{"quote":"He has a rare ability to balance speed with quality. Across dozens of client projects, Marcus consistently delivered polished, performant products on time — and our clients always asked for him by name.","name":"David Park","role":"Product Director, Digital Forge Studios","initials":"DP"},{"quote":"Working with Marcus felt like having a co-founder, not a contractor. He understood the business goals behind every feature and pushed back when something didn''t serve our users. Our inquiries jumped 45% after his work.","name":"Elena Rodriguez","role":"Chief Technology Officer, NestFind","initials":"ER"}]'::jsonb
);

insert into public.projects (id, slug, title, subtitle, category, short_description, card_description, about, achievements, image_url, live_url, is_featured, sort_order) values
  (1, 'shopvault', 'ShopVault', 'E-Commerce Platform', 'Fullstack', 'Full-stack e-commerce platform', 'Full-stack commerce engine that processed $2M+ in transactions with 99.9% uptime.', 'Built a comprehensive e-commerce platform from the ground up with product management, inventory tracking, payment processing, and order fulfillment. Implemented server-side rendering for SEO optimization and a headless CMS for content management.', 'Processed over $2M in transactions within the first 6 months with 99.9% uptime.', '/assets/images/shopvault.svg', '#', true, 1),
  (2, 'datapulse', 'DataPulse', 'Real-Time Analytics', 'Frontend', 'Real-time analytics dashboard', 'Live dashboards visualizing millions of data points with sub-500ms latency.', 'Designed and built a real-time analytics dashboard that streams and visualizes millions of data points, with interactive charts, filters and responsive layouts that stay fast under heavy load.', 'Delivered live visualizations with sub-500ms latency across millions of data points.', '/assets/images/datapulse.svg', '#', true, 2),
  (3, 'nestfind', 'NestFind', 'Real Estate Platform', 'WordPress', 'Modern real estate web application', 'AI-powered property search with interactive maps and virtual tours.', 'Created a modern real estate platform with AI-powered property search, interactive maps and virtual tours, built on a customized WordPress foundation with custom themes and templates.', 'Helped users discover properties faster with smart search, interactive maps and virtual tours.', '/assets/images/nestfind.svg', '#', true, 3),
  (4, 'connecthub', 'ConnectHub', 'Social Media Management', 'Fullstack', 'Social media management platform', 'Social media management platform for scheduling and analytics.', 'A social media management platform for planning content, scheduling posts and tracking engagement analytics across channels.', '', '/assets/images/connecthub.svg', '#', false, 4),
  (5, 'vaultpay', 'VaultPay', 'Fintech Banking', 'Fullstack', 'Fintech banking web application', 'Fintech banking web application with transaction history and portfolio insights.', 'A fintech banking web application featuring transaction history, portfolio performance charts and a secure dashboard experience.', '', '/assets/images/vaultpay.svg', '#', false, 5),
  (6, 'medconnect', 'MedConnect', 'Healthcare Portal', 'Frontend', 'Healthcare patient portal', 'Healthcare patient portal for appointments and records.', 'A healthcare patient portal for booking appointments, viewing records and messaging providers, built during my internship training.', '', '/assets/images/medconnect.svg', '#', false, 6),
  (7, 'learnpath', 'LearnPath', 'Learning Platform', 'Frontend', 'Educational learning platform', 'Educational learning platform with course progress tracking.', 'An educational learning platform with video courses, progress tracking and a clean course dashboard, built during my internship training.', '', '/assets/images/learnpath.svg', '#', false, 7);

insert into public.experience (id, title, company, start_date, end_date, description, bullets, sort_order) values
  (1, 'Full Stack Developer', 'Eden Technology360', 'Sep 2024', 'Aug 2026', 'At Eden Technology360, I built and maintained full-stack web applications and WordPress sites, owning the complete development lifecycle from design and database modeling to deployment and ongoing optimization.', '["Developed and maintained full stack web applications using HTML, CSS, JavaScript, PHP, and MySQL","Built and customized WordPress websites, including custom themes and page templates","Designed and implemented database structures in MySQL to support application features","Collaborated with designers and stakeholders to translate requirements into functional, responsive web pages","Debugged and optimized existing codebases to improve performance and reliability"]'::jsonb, 1),
  (2, 'WordPress Developer', 'Testament Technology', 'Aug 2022', 'Aug 2024', 'At Testament Technology, I delivered customized WordPress websites for a range of clients, building responsive front-ends with custom PHP and handling ongoing maintenance, bug fixes, and performance improvements.', '["Built and customized WordPress websites for clients using themes and custom PHP code","Implemented responsive designs using HTML, CSS, and JavaScript to ensure cross-device compatibility","Handled website updates, bug fixes, and performance improvements for existing WordPress sites","Worked with clients to gather requirements and deliver websites that matched their specifications"]'::jsonb, 2),
  (3, 'Intern', 'Murphy Computer Institute', 'Jan 2021', 'Jul 2022', 'At Murphy Computer Institute, I gained foundational training in computer systems and web development, building core technical skills through supervised practical projects and coursework.', '["Gained foundational training and hands-on experience in computer systems and web development basics","Assisted with practical tasks and projects under supervision, building core technical skills","Developed early proficiency in HTML, CSS, and general computer literacy"]'::jsonb, 3);

insert into public.experience_projects (experience_id, project_id, sort_order) values
  (1, 1, 1),
  (1, 2, 2),
  (1, 3, 3),
  (2, 4, 1),
  (2, 5, 2),
  (3, 6, 1),
  (3, 7, 2);

insert into public.skills (id, name, category, icon_url, sort_order) values
  (1, 'HTML5 / CSS3', 'Core Skill', '', 1),
  (2, 'HTML5', 'Tool / Technology', '/assets/images/icons/html5.svg', 2),
  (3, 'English', 'Language', '', 3),
  (4, 'JavaScript', 'Core Skill', '', 4),
  (5, 'CSS3', 'Tool / Technology', '/assets/images/icons/css3.svg', 5),
  (6, 'PHP', 'Core Skill', '', 6),
  (7, 'JavaScript', 'Tool / Technology', '/assets/images/icons/javascript.svg', 7),
  (8, 'PHP', 'Tool / Technology', '/assets/images/icons/php.svg', 8),
  (9, 'MySQL', 'Core Skill', '', 9),
  (10, 'MySQL', 'Tool / Technology', '/assets/images/icons/mysql.svg', 10),
  (11, 'WordPress (Custom Themes)', 'Core Skill', '', 11),
  (12, 'WordPress', 'Tool / Technology', '/assets/images/icons/wordpress.svg', 12),
  (13, 'Git', 'Core Skill', '', 13),
  (14, 'Responsive Design', 'Core Skill', '', 14),
  (15, 'Elementor', 'Tool / Technology', '/assets/images/icons/elementor.svg', 15),
  (16, 'Database Design & Management', 'Core Skill', '', 16);

insert into public.education (id, institution, qualification, year, sort_order) values
  (1, 'Auchi Polytechnic, Auchi', 'Higher National Diploma (HND), Software and Web Development', '2026', 1),
  (2, 'Auchi Polytechnic, Auchi', 'National Diploma (ND), Computer Science', '2023', 2);

select setval(pg_get_serial_sequence('public.projects', 'id'), (select coalesce(max(id), 1) from public.projects));
select setval(pg_get_serial_sequence('public.experience', 'id'), (select coalesce(max(id), 1) from public.experience));
select setval(pg_get_serial_sequence('public.skills', 'id'), (select coalesce(max(id), 1) from public.skills));
select setval(pg_get_serial_sequence('public.education', 'id'), (select coalesce(max(id), 1) from public.education));
