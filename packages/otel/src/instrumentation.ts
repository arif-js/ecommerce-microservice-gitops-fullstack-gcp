import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

import { TraceExporter as GCPTraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';

// For troubleshooting, set to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

export const initOTel = (serviceName: string) => {
  // Use GCP Trace in production (Cloud Run sets K_SERVICE), otherwise OTLP
  const exporter = process.env.K_SERVICE
    ? new GCPTraceExporter()
    : new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
    });

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
    traceExporter: exporter,
    instrumentations: [
      new HttpInstrumentation(),
      new NestInstrumentation(),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OTel shut down successfully'))
      .catch((error) => console.log('Error shutting down OTel', error))
      .finally(() => process.exit(0));
  });

  return sdk;
};
