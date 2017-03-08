## architecture

### customer client
* plain HTML/CSS widget for client's loaded by JS async snippet
* loads conversation/message history (based on IP?)
* hitting enter/send creates HTTP request with message body, timestamp, current page, etc

### company client
* dashboard has all conversations
* conversations have messages and completion (boolean), also agents in the future
* hitting enter/send creates HTTP request with message body, timestamp, current page, etc

### server
* when triggered by customer client, alerts company (by email, Slack, SMS, HTTP, and dashboard)
* persists messages to DB (DBaaS?)
* adds analytics to user in DB - # of messages, # of sessions, email, name, etc
* when triggered by company client (email, Slack, SMS, HTTP, or dashboard) adds message to DB, pushes to customer client (through widget or email)

Clients ranked by importance - dashboard, email, Slack, HTTP, SMS


## pricing

* free open source version w/branding (License is violated if removed)
* docs on how to set up on AWS Lambda, GCF, or generic Ubuntu VM using webhooks/HTTP
* paid version could either be price fixed at somewhere between $5 and $20/month, or based on usage
* usage would just take cloud FaaS bill and multiply it by some constant (3x? 5x? 10x?)
* paid version also would have no branding


## design

* all client side JS needs to work on any browser that is 4 years old - no ES6
* resend has best overall design
* intercom has best site design


## security

* customer client needs server url to decide which server to use
* server needs to lock customer client to only work on pre approved client urls
