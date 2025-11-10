{{/*
Expand the name of the chart.
*/}}
{{- define "servexa.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "servexa.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "servexa.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "servexa.labels" -}}
helm.sh/chart: {{ include "servexa.chart" . }}
{{ include "servexa.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "servexa.selectorLabels" -}}
app.kubernetes.io/name: {{ include "servexa.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "servexa.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "servexa.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Database host
*/}}
{{- define "servexa.databaseHost" -}}
{{- if .Values.postgres.enabled }}
{{- printf "%s-postgres" (include "servexa.fullname" .) }}
{{- else }}
{{- .Values.externalDatabase.host }}
{{- end }}
{{- end }}

{{/*
Redis host
*/}}
{{- define "servexa.redisHost" -}}
{{- if .Values.redis.enabled }}
{{- printf "%s-redis" (include "servexa.fullname" .) }}
{{- else }}
{{- .Values.externalRedis.host }}
{{- end }}
{{- end }}

{{/*
Common environment variables
*/}}
{{- define "servexa.commonEnv" -}}
- name: SPRING_PROFILES_ACTIVE
  value: {{ .Values.environment.springProfile | quote }}
- name: DB_HOST
  value: {{ include "servexa.databaseHost" . }}
- name: DB_PORT
  value: "5432"
- name: REDIS_HOST
  value: {{ include "servexa.redisHost" . }}
- name: REDIS_PORT
  value: "6379"
- name: DB_USERNAME
  valueFrom:
    secretKeyRef:
      name: {{ include "servexa.fullname" . }}-postgres-secret
      key: username
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ include "servexa.fullname" . }}-postgres-secret
      key: password
{{- end }}