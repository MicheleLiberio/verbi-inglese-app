function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");

  if (sectionId === "toIngPractice") {
    restartToIng();
    loadHistory("toIng");
  }

  if (sectionId === "irregularPractice") {
    restartIrregular();
    loadHistory("irregular");
    loadIrregularReviewStats();
  }

  if (sectionId === "reportingPractice") {
    restartReporting();
    loadHistory("reporting");
  }
}
