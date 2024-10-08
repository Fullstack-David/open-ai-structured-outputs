document.getElementById("contentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = {
    topic: document.getElementById("topic").value,
    audience: document.getElementById("audience").value,
    tone: document.getElementById("tone").value,
    length: document.getElementById("length").value,
  };

  try {
    const response = await fetch("/generate-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
                    <h2>${data.generatedContent.title}</h2>
                    <p>${data.generatedContent.content}</p>
                `;
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("result").textContent =
      "An error occurred while generating content.";
  }
});
