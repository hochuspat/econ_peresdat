document.addEventListener("DOMContentLoaded", function () {
    const groupSelect = document.getElementById("groupSelect");
    const lessonCards = document.getElementById("lessonCards");

    groupSelect.addEventListener("change", async function () {
        const selectedGroup = groupSelect.value;

        // Очищаем текущие карточки
        lessonCards.innerHTML = "";

        // Запрашиваем данные с сервера
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/lessons/${selectedGroup}`);
        const lessons = await response.json();

        // Создаем карточки для каждого урока и добавляем их на страницу
        lessons.forEach(lesson => {
            const card = document.createElement("div");
            card.classList.add("lesson-card");

            const lessonHTML = `
                <h2>${lesson.subject}</h2>
                <p>Дата: ${lesson.date}</p>
                <p>Время: ${lesson.time}</p>
                <p>Пара: ${lesson.para}</p>
                <p>Подгруппа: ${lesson.subgroup}</p>
            `;

            card.innerHTML = lessonHTML;
            lessonCards.appendChild(card);
        });
    });
});
