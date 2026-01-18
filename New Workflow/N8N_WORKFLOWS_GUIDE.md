# n8n Workflows - Upload Guide

All workflows are configured to use the **Unified Master Sheet**:
- **Sheet ID:** `1IFAAelyD_x2uCOQKcbj8n7wgizNtVirAYbqCv67Y468`
- **Location:** `/Training LMS Master - 2026/`

---

## Required Sheet Tabs

Make sure your Google Sheet has these tabs:

| Tab | Purpose |
|-----|---------|
| Trainees | All trainee records |
| Schedule_Adjustments | Reschedules with reason codes |
| Assessment_Config | Assessment schedule by role/day |
| Assessment_Scores | All assessment submissions |
| Coach_Directory | Coach assignments and contact info |
| Notification_Log | Track all emails/notifications sent |
| Performance_Summary | Aggregated metrics for reporting |
| **Alert_Log** | NEW: Track RED/ORANGE alerts |

---

## Workflows to Upload

### 1. Data Fetching (GET Webhooks)

| File | Webhook Path | Method | Purpose |
|------|--------------|--------|---------|
| `API_ Fetch Trainees (UNIFIED).json` | `/trainees` | GET | Fetch trainee list |
| `LMS Data_ Fetch Scores.json` | `/scores` | GET | Fetch scores by trainee email |
| `LMS Data_ Fetch Alerts.json` | `/alerts` | GET | Fetch alerts by coach email |

### 2. Workflow Triggers (POST Webhooks)

| File | Webhook Path | Method | Purpose |
|------|--------------|--------|---------|
| `Win 1 - Lark Calendar Version.json` | `/trigger/welcome` | POST | Welcome email + calendar |
| `Win 4_ Final Report (UNIFIED - LMS Triggered).json` | `/final-report` | POST | Send final training report |
| `Win 2.5_ Score Notification (UNIFIED).json` | (Form trigger) | - | Notify on score submission |

### 3. Scheduled Workflows

| File | Schedule | Purpose |
|------|----------|---------|
| `Win 2.1_ Daily Assessment Digest.json` | 9:30 AM daily | Assessment digest to coaches |
| `Win 3_ Incomplete Assessment Alerter (UNIFIED).json` | 30 min interval | Check for at-risk trainees |
| `Win 6_ AI-Powered Feedback Analysis System.json` | On demand | AI feedback analysis |

---

## Webhook URLs for LMS

These are configured in `.env.local`:

```env
# GET Webhooks
N8N_WEBHOOK_TRAINEES=https://storehub.app.n8n.cloud/webhook/trainees
N8N_WEBHOOK_SCORES=https://storehub.app.n8n.cloud/webhook/scores
N8N_WEBHOOK_ALERTS=https://storehub.app.n8n.cloud/webhook/alerts

# POST Webhooks
N8N_WEBHOOK_FINAL_REPORT=https://storehub.app.n8n.cloud/webhook/final-report
N8N_WEBHOOK_WELCOME=https://storehub.app.n8n.cloud/webhook/trigger/welcome
```

---

## Upload Order

1. **First**: Data fetching workflows (API_ Fetch Trainees, LMS Data_ Fetch Scores, LMS Data_ Fetch Alerts)
2. **Second**: Trigger workflows (Win 1, Win 4)
3. **Third**: Scheduled workflows (Win 2.1, Win 3, Win 6)

---

## Testing Checklist

After uploading each workflow:

- [ ] Activate the workflow in n8n
- [ ] Test the webhook URL in browser (GET) or Postman (POST)
- [ ] Verify data is returned correctly
- [ ] Check LMS can fetch the data

### Test Commands

```bash
# Test trainees endpoint
curl "https://storehub.app.n8n.cloud/webhook/trainees"

# Test scores endpoint (with dummy email)
curl "https://storehub.app.n8n.cloud/webhook/scores?traineeEmail=test@storehub.com"

# Test alerts endpoint (with coach email)
curl "https://storehub.app.n8n.cloud/webhook/alerts?coachEmail=coach@storehub.com"
```

---

## Credentials Needed in n8n

1. **Google Sheets OAuth2** - For reading/writing sheet data
2. **Gmail OAuth2** - For sending emails
3. **Lark Calendar** (optional) - For calendar invites

All workflows reference credential ID `xWkX5ODqyr8g6JBX` for Google Sheets. Update if your credential ID is different.
