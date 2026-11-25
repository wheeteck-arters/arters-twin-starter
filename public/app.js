const form = document.getElementById("ask-form");
if (form) form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = document.getElementById("answer");
  const btn = form.querySelector("button");
  const question = document.getElementById("q").value;
  out.textContent = "Thinking...";
  btn.disabled = true;
  try {
    const res = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question }) });
    const data = await res.json();
    out.innerHTML = "";
    const p = document.createElement("p"); p.textContent = data.answer; out.appendChild(p);
    if (data.sources?.length) {
      const ul = document.createElement("ul"); ul.className = "sources";
      for (const s of data.sources) {
        const li = document.createElement("li"); const a = document.createElement("a");
        a.href = s.url; a.textContent = `[${s.n}] ${s.title}`; li.appendChild(a); ul.appendChild(li);
      }
      out.appendChild(ul);
    }
  } catch { out.textContent = "Couldn't reach the Twin. Please try again."; }
  btn.disabled = false;
});
