import { IS_DEVELOPMENT } from "@src/configuration/secrets";
import { InitRouteFunction } from "@src/types";
import { Router } from "express";
// import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  //   router.use((req, _, next) => requireAuthentication(req, next, services));
  if (IS_DEVELOPMENT) {
    router.get("/", (req, res) => {
      const jobs = workers.getAllJobs().map((j) => ({ name: j.name }));
      res.status(200).json(jobs);
    });

    router.get("/emails", async (req, res) => {
      const emails = workers.getAllEmails();
      res.status(200).json(emails.map((e) => ({ name: e.name })));
    });

    router.get("/emails/:name", async (req, res) => {
      const email = workers.getAllEmails().find((e) => e.name === req.params.name);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }

      const html = await email.getPreviewHtml();

      res.send(html);
    });

    router.post("/:name", async (req, res) => {
      const job = workers.getAllJobs().find((j) => j.name === req.params.name);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      await job.now(req.body);

      res.status(200).json({ message: "Job triggered" });
    });
  }
  return router;
};

export default {
  path: "/workers",
  init,
};
