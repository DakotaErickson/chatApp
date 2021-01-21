const socket = io();

// // listen for an event to be emitted by the server
socket.on('message', (message) => {
    console.log(message);
})

// Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#sendLocationButton');

// emit an event for the server when form is submitted
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //disable the form after it has been submitted
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        // enable the form after receiving acknowledgement
        // clear the input element of the old message and reset
        // the focus onto the input element
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log('Message delivered.');
    });
})

// sharing location
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    // disable the button while sending location
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // during the acknowledgement remove the disabled attribute from the button
            $sendLocationButton.removeAttribute('disabled');
        });
    });
})