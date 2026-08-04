-- 학원 · 레테 · 일정 시드 (lib/seed.ts 와 동일 내용)
insert into academies (name, slug, region, description) values
  ('MI 영어', 'mi', '대치동', '대치동 최상위권 영어학원. 원서 리딩과 라이팅 비중이 높고 레테 통과 난이도가 높기로 유명합니다.'),
  ('트윈클', 'twinkle', '대치동', '초등 상위권 대상 영어학원. 어휘·문법 정확도와 스피드 리딩 위주의 레벨테스트가 특징입니다.'),
  ('에디센', 'edisen', '분당', '분당권 대표 영어학원. 디베이트·에세이 라이팅 역량을 레테에서 집중적으로 평가합니다.'),
  ('피아이(PI)', 'pi', '광교', '광교 신도시 상위권 영어학원. 논픽션 독해와 서술형 라이팅 중심의 프랩이 요구됩니다.')
on conflict (slug) do nothing;

insert into level_tests (academy_id, name, format_summary, difficulty)
select id, 'MI 정규반 레벨테스트', '원서 지문 독해 + 서술형 라이팅 2문항 + 어휘. 90분.', 5 from academies where slug='mi'
union all
select id, '트윈클 입학 레테', '스피드 리딩 + 문법 객관식 + 받아쓰기(딕테이션). 60분.', 3 from academies where slug='twinkle'
union all
select id, '에디센 디베이트반 레테', '에세이 라이팅 1편 + 구술 인터뷰. 75분.', 4 from academies where slug='edisen'
union all
select id, 'PI 프랩 레벨테스트', '논픽션 독해 + 서술형 요약 라이팅 + 어휘. 80분.', 4 from academies where slug='pi';

insert into test_schedules (academy_id, test_date, apply_deadline, note)
select id, '2026-08-23', '2026-08-16', '9월 정규반 편성' from academies where slug='mi'
union all
select id, '2026-08-17', '2026-08-12', '초등부 신규반' from academies where slug='twinkle'
union all
select id, '2026-08-30', '2026-08-23', '가을학기 디베이트반' from academies where slug='edisen'
union all
select id, '2026-09-06', '2026-08-30', '프랩 집중반' from academies where slug='pi';
