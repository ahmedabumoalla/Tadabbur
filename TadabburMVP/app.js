function nextStep(step) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
}
