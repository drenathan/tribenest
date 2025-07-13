import supertest, { Test } from "supertest";

import { Database } from "@src/db/";
import { Services } from "@src/services";
import { Workers } from "@src/workers";
import { initApp } from "@src/app";
import TestAgent from "supertest/lib/agent";

export type TestApp = TestAgent<Test>;
export const testDatabase = new Database();
export const testServices = new Services(testDatabase);
export const testWorkers = new Workers(testServices);
const args = { services: testServices, workers: testWorkers };

// Helper function to create test app
export const createTestApp = async () => {
  const app = await initApp(args);
  return supertest(app);
};

// For backward compatibility, we'll need to update test files to use createTestApp() instead
// export const testApp = createTestApp();
