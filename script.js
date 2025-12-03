async function cauta() {
    const fisierList = ["ion.txt", "alexandru.txt", "oxentie.txt", "lilian.txt"];
    const caut = document.getElementById("cautare").value.toLowerCase();
    const rezultatDiv = document.getElementById("rezultat");
    rezultatDiv.innerHTML = "";

    if (!caut) {
        rezultatDiv.innerHTML = "";
        return;
    }

    let gasit = false;

    for (let fis of fisierList) {
        try {
            let text = await fetch(fis).then(r => r.text());
            let linii = text.split("\n");

            let rezultateFisier = "";
            linii.forEach((linie, nr) => {
                if (linie.toLowerCase().includes(caut)) {
                    gasit = true;
                    // Highlight the search term in bold
                    let linieSursa = linie;
                    let liniaHighlight = linie.replace(
                        new RegExp(`(${caut})`, 'gi'),
                        '<strong>$1</strong>'
                    );
                    rezultateFisier += `Linia ${nr + 1}: ${liniaHighlight}\n`;
                }
            });

            if (rezultateFisier) {
                rezultatDiv.innerHTML += 
                    `<strong>---- Găsit în: ${fis} ----</strong>\n${rezultateFisier}\n`;
            }

        } catch (err) {
            rezultatDiv.innerHTML += `Nu pot încărca ${fis}\n`;
        }
    }

    if (!gasit && caut) {
        rezultatDiv.innerHTML = "Nu s-a găsit nimic în niciun fișier.";
    }
}

// Configurează căutarea în timp real când utilizatorul scrie
document.addEventListener("DOMContentLoaded", function() {
    const inputCautare = document.getElementById("cautare");
    inputCautare.addEventListener("input", cauta);
});
