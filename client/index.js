const $h1 = document.querySelector(".h1");
const $p = document.querySelector(".p");

async function getData() {
  try {
    const response = await fetch("http://localhost:3000/api/recipes");

    if (!response.ok) {
      throw new Error("La solicitud no pudo completarse correctamente");
    }

    const data = await response.json();
    console.log(data);

    const recipeName = data[2].name;
    const recipePrepProcess = data[2].prepProcess;
    updateElements(recipeName, recipePrepProcess);
    
  } catch (error) {
    console.error("Ocurrió un error", error);
  }
};

const updateElements = (recipeName, recipePrepProcess) => {
  $h1.textContent = recipeName;
  $p.textContent = recipePrepProcess;
}

getData();