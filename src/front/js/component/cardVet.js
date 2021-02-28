import React from "react";
import { Col, Card, ListGroup, ListGroupItem, Button } from "react-bootstrap";

const CardVet = () => {
	return (
		<Col xs="6">
			<Card border="0" style={{ width: "18rem", backgroundColor: "" }}>
				<Card.Header className="bg-danger" style={{ color: "white" }}>
					¿No tienes el historial de las mascotas que atiendes?
				</Card.Header>
				<Card.Img
					variant="top"
					src="https://lh3.googleusercontent.com/proxy/bSl4Qt8Fay1SR9jtW5B6BqgurigWHWfFfwhE_ltGJaaRYJ8ArdzDmo_G0_eiI1s9kC8DTzGZ3gV47z-4KPGCRZNvHiMerbtkujevhPjoPoVJ79nhvxWbH5cIGjoRgnidRZlifODbwtpTY96hshVpEnjFVw"
				/>
				<Card.Body>
					<Card.Title style={{ color: "#07889B" }}> Veterinari@</Card.Title>
					<Card.Text />
				</Card.Body>
				<ListGroup className="list-group-flush" style={{ color: "#E37222" }}>
					<ListGroupItem>Ficha estandarizada</ListGroupItem>
					<ListGroupItem>Control de tus registros</ListGroupItem>
				</ListGroup>
				<Card.Body>
					<Button variant="primary" href="#">
						Me interesa!!
					</Button>
				</Card.Body>
			</Card>
		</Col>
	);
};

export default CardVet;