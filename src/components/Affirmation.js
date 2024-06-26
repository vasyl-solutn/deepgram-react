import { useState, useRef } from 'react'


export default function Affirmation() {
    const [affirmation, setAffirmation] = useState('')
	const [finalAffirmation, setFinalAffirmation] = useState(false)
	const socketRef = useRef(null)

	const handleChange = (e) => {
		setAffirmation(e.target.value)
	}
    const handleSubmit = (e) => {
		e.preventDefault()

		setFinalAffirmation(true)
	}
	const activateMicrophone =  ( )  => {

		console.log('Submit')

		//Add microphone access
		navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
			if (!MediaRecorder.isTypeSupported('audio/webm'))
				return alert('Browser not supported')
			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'audio/webm',
			})

		//create a websocket connection
		 const socket = new WebSocket('ws://localhost:3002')
			socket.onopen = () => {
				console.log({ event: 'onopen' })
				mediaRecorder.addEventListener('dataavailable', async (event) => {
					if (event.data.size > 0 && socket.readyState === 1) {
						socket.send(event.data)
					}
				})
				mediaRecorder.start(1000)
			}

			socket.onmessage = (message) => {
				const received = JSON.parse(message.data)
				// console.log({ event: 'onmessage', received })
				const transcript = received.channel.alternatives[0].transcript
				if (transcript) {
					console.log(transcript)
					setAffirmation(transcript)
				}
			}

			socket.onclose = () => {
				console.log({ event: 'onclose' })
			}

			socket.onerror = (error) => {
				console.log({ event: 'onerror', error })
			}

			socketRef.current = socket
		})
		}

return(
    <div className='App'>
<div>
<header className="header text">Affirmation</header>
</div>
<div className="card ">
     <div className='container'>


<div className='journal-body'>
{!finalAffirmation ? (
				<>
					<div className='description'>
						What affirmation do you want to give to yourself today?
					</div>
					<form onSubmit={handleSubmit}>
						<textarea
							className='journal-input'
							value={affirmation}
							onChange={handleChange}
						/>
						<br />
						<button
							type='submit'
							className='submit-button'
							disabled={affirmation.length === 0}>
							Submit
						</button>

<button
	onClick={activateMicrophone}
	type='button'
	className='submit-button'>
	Voice 💬
</button>

					</form>
				</>
			) : (
				<>
					<h2>Today's Entry</h2>
					<div className='description'>{affirmation}</div>
				</>
			)}
         </div>
         </div>
         </div>
         </div>
)
}
