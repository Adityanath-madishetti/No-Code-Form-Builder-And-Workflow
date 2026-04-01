# Form Properties + Reviewer Access: Quick Test

## 1) Setup
- Start backend and frontend.
- Login once with these emails to create users:
  - `owner@test.com`, `editor@test.com`, `reviewer@test.com`, `viewer@test.com`

## 2) Owner flow
- Login as `owner@test.com` and create a form.
- In **Form Properties**, set:
  - Editors: `editor@test.com`
  - Reviewers: `reviewer@test.com`
  - Viewers: `viewer@test.com`
  - Who Can Fill: `Private`
  - Response Limit: `1`
  - Deadline: future date/time
  - Collect Email: `Required`
  - Submission Policy: `Submit once (no edit)`
  - Can Viewer View Their Submission: `Yes`
- Save and Publish.

## 3) Fill access checks
- Open form link while logged out: should fail for `Private`.
- Login as `viewer@test.com`: should open and submit.
- Submit again as viewer: should fail (limit/policy).

## 4) Reviewer checks
- Login as `reviewer@test.com`.
- On dashboard, verify **Forms Shared With You** contains the form.
- Click **View Submissions**:
  - Submissions list should load.
  - Clicking a row should open submission details (read-only).

## 5) Role checks
- `editor@test.com`: can open/edit form builder, but cannot review submissions unless added as reviewer.
- `owner@test.com`: full access.
