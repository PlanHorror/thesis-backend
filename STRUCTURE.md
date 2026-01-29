.
├── attactments
├── common
│   ├── decorator
│   │   ├── getuser.decorator.ts
│   │   └── index.ts
│   ├── enum
│   │   ├── index.ts
│   │   └── role.enum.ts
│   ├── guard
│   │   ├── index.ts
│   │   └── role.guard.ts
│   ├── index.ts
│   ├── interface
│   │   ├── account.interface.ts
│   │   ├── document.interface.ts
│   │   └── index.ts
│   ├── utils
│   │   ├── file.util.ts
│   │   └── index.ts
│   └── validator
│       ├── date.validator.ts
│       └── index.ts
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── prisma
│   ├── migrations
│   │   ├── 20250919071526_init_model_v2
│   │   │   └── migration.sql
│   │   ├── 20250919073706_update_active_status
│   │   │   └── migration.sql
│   │   ├── 20250921145335_update_lecturer_table_name
│   │   │   └── migration.sql
│   │   ├── 20251009072412_init_course_table
│   │   │   └── migration.sql
│   │   ├── 20251020222515_add_lecturer_and_department_id
│   │   │   └── migration.sql
│   │   ├── 20251023011549_init_semester_table
│   │   │   └── migration.sql
│   │   ├── 20251023012237_init_course_on_semester_table
│   │   │   └── migration.sql
│   │   ├── 20251023015638_add_constraint_course_on_semester
│   │   │   └── migration.sql
│   │   ├── 20251025100001_fix_course_on_semester
│   │   │   └── migration.sql
│   │   ├── 20251026083332_fix_datatype_for_start_time_and_end_time
│   │   │   └── migration.sql
│   │   ├── 20251027084421_init_course_enrollment_table
│   │   │   └── migration.sql
│   │   ├── 20260126112752_new_schema
│   │   │   └── migration.sql
│   │   ├── 20260128032757_fix_course_document_scea
│   │   │   └── migration.sql
│   │   ├── 20260128230610_init_webhook_object
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── README.md
├── src
│   ├── admin
│   │   ├── admin.controller.spec.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.module.ts
│   │   ├── admin.service.spec.ts
│   │   ├── admin.service.ts
│   │   ├── course
│   │   │   ├── course.controller.spec.ts
│   │   │   ├── course.controller.ts
│   │   │   └── enrollment
│   │   │       ├── enrollment.controller.spec.ts
│   │   │       ├── enrollment.controller.ts
│   │   │       └── session
│   │   │           ├── session.controller.spec.ts
│   │   │           └── session.controller.ts
│   │   ├── department
│   │   │   ├── department.controller.spec.ts
│   │   │   └── department.controller.ts
│   │   ├── dto
│   │   │   ├── admin.dto.ts
│   │   │   ├── course.dto.ts
│   │   │   ├── course-enrollment.dto.ts
│   │   │   ├── department.dto.ts
│   │   │   ├── enrollment-session.dto.ts
│   │   │   ├── exam-schedule.dto.ts
│   │   │   ├── lecturer.dto.ts
│   │   │   ├── notification.dto.ts
│   │   │   ├── semester.dto.ts
│   │   │   └── student.dto.ts
│   │   ├── exam-schedule
│   │   │   ├── exam-schedule.controller.spec.ts
│   │   │   └── exam-schedule.controller.ts
│   │   ├── lecturer
│   │   │   ├── lecturer.controller.spec.ts
│   │   │   └── lecturer.controller.ts
│   │   ├── notification
│   │   │   ├── notification.controller.spec.ts
│   │   │   └── notification.controller.ts
│   │   ├── semester
│   │   │   ├── course-semester
│   │   │   │   ├── course-semester.controller.spec.ts
│   │   │   │   └── course-semester.controller.ts
│   │   │   ├── semester.controller.spec.ts
│   │   │   └── semester.controller.ts
│   │   └── student
│   │       ├── student.controller.spec.ts
│   │       └── student.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── auth
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   │   ├── auth.service.ts
│   │   ├── dto
│   │   │   └── auth.dto.ts
│   │   └── strategies
│   │       └── access.strategy.ts
│   ├── course
│   │   ├── course.controller.spec.ts
│   │   ├── course.controller.ts
│   │   ├── course.module.ts
│   │   ├── course.service.spec.ts
│   │   ├── course.service.ts
│   │   ├── document
│   │   │   ├── document.controller.spec.ts
│   │   │   ├── document.controller.ts
│   │   │   ├── document.module.ts
│   │   │   ├── document.service.spec.ts
│   │   │   ├── document.service.ts
│   │   │   └── dto
│   │   │       └── document.dto.ts
│   │   └── enrollment
│   │       ├── enrollment.controller.spec.ts
│   │       ├── enrollment.controller.ts
│   │       ├── enrollment.module.ts
│   │       ├── enrollment.service.spec.ts
│   │       ├── enrollment.service.ts
│   │       └── session
│   │           ├── session.controller.spec.ts
│   │           ├── session.controller.ts
│   │           ├── session.module.ts
│   │           ├── session.service.spec.ts
│   │           └── session.service.ts
│   ├── department
│   │   ├── department.controller.spec.ts
│   │   ├── department.controller.ts
│   │   ├── department.module.ts
│   │   ├── department.service.spec.ts
│   │   └── department.service.ts
│   ├── exam-schedule
│   │   ├── exam-schedule.controller.spec.ts
│   │   ├── exam-schedule.controller.ts
│   │   ├── exam-schedule.module.ts
│   │   ├── exam-schedule.service.spec.ts
│   │   └── exam-schedule.service.ts
│   ├── gateway
│   │   ├── gateway.module.ts
│   │   └── gateway.ts
│   ├── main.ts
│   ├── notification
│   │   ├── notification.controller.spec.ts
│   │   ├── notification.controller.ts
│   │   ├── notification.module.ts
│   │   ├── notification.service.spec.ts
│   │   └── notification.service.ts
│   ├── prisma
│   │   └── prisma.service.ts
│   ├── semester
│   │   ├── course-semester
│   │   │   ├── course-semester.controller.spec.ts
│   │   │   ├── course-semester.controller.ts
│   │   │   ├── course-semester.module.ts
│   │   │   ├── course-semester.service.spec.ts
│   │   │   └── course-semester.service.ts
│   │   ├── semester.controller.spec.ts
│   │   ├── semester.controller.ts
│   │   ├── semester.module.ts
│   │   ├── semester.service.spec.ts
│   │   └── semester.service.ts
│   ├── user-manager
│   │   ├── dto
│   │   ├── lecturer
│   │   │   ├── lecturer.controller.spec.ts
│   │   │   ├── lecturer.controller.ts
│   │   │   ├── lecturer.module.ts
│   │   │   ├── lecturer.service.spec.ts
│   │   │   └── lecturer.service.ts
│   │   └── student
│   │       ├── student.controller.spec.ts
│   │       ├── student.controller.ts
│   │       ├── student.module.ts
│   │       ├── student.service.spec.ts
│   │       └── student.service.ts
│   └── webhook
│       ├── webhook.controller.spec.ts
│       ├── webhook.controller.ts
│       ├── webhook.module.ts
│       ├── webhook.service.spec.ts
│       └── webhook.service.ts
├── STRUCTURE.md
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
├── tsconfig.json
└── yarn.lock

59 directories, 151 files
