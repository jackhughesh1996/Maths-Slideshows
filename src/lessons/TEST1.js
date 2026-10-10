/**
 * @file TEST1.js
 * Temporary integration test lesson for verifying the multi-page static build pipeline.
 */

export default {
  id: "TEST1",
  title: "Temporary Pipeline Test",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Integration Tests",
  folder: "Pipeline Verification",
  topics: ["Testing"],
  slides: [
    {
      type: "title",
      phase: "opening",
      estimatedMinutes: 1,
      title: "Temporary Pipeline Test",
      subtitle: "Verifying the build and generation pipeline",
      overview: "This is a temporary lesson designed to test multi-page static generation and launchers.",
      topics: ["Testing"]
    },
    {
      type: "learning",
      phase: "opening",
      estimatedMinutes: 2,
      title: "Learning Intentions",
      subtitle: "Goals for this pipeline verification test",
      learningIntention: "To verify the static multi-page generation pipeline.",
      successCriteria: [
        "I can verify that lesson pages, catalogue entries, and launchers are generated automatically."
      ],
      keyPrinciple: "A unified manifest and metadata catalog ensures every lesson builds deterministically."
    },
    {
      type: "summary",
      phase: "assessment",
      estimatedMinutes: 3,
      title: "Lesson Summary: TEST1",
      takeaways: [
        "The lesson manifest correctly links new lessons.",
        "Static HTML entry points and catalogue entries are automatically generated.",
        "HTML launchers are created with correct redirection URLs."
      ]
    }
  ]
};
