import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import NewPetForm from "../component/newPetForm";

function NewPet() {
	return (
		<div>
			<Container>
				<br />
				<br />
				<NewPetForm />
			</Container>
		</div>
	);
}

export default NewPet;