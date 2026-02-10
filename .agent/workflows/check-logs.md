---
description: Read the relevant log file for your role and analyze the latest terminal output.
---

1. Identify your role (Backend, Frontend or QA).
2. Use `view_file` to read the corresponding log:
   - Backend: `.tmp/backend.log`, '.tmp\backend_deploy.log', '.tmp\manual_api_test.log'
   - Frontend: '.tmp\frontend.log', '.tmp\manual_api_test.log', 
   - QA: `.tmp/qa.log`, '.tmp\manual_api_test.log', '.tmp\serialization_test.log'
3. Analyze any errors or output found in the file.
4. Report your findings to the user.