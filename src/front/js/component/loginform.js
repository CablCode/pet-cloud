import React from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const LoginForm = () => {
	return (
		<Container className="loginForms">
			<Form autocomplete="off" className="p-5 text-center">
				<Form.Control type="email" placeholder="Ingresa tu e-mail" className="m-3" />
				<Form.Group className="m-3">
					<Form.Control type="password" placeholder="Ingresa tu contraseña" />
					<Form.Text>La contraseña debe tener entre 6 a 12 characteres</Form.Text>
				</Form.Group>
				<Link to="/pwrd">¿Olvidaste tu contraseña?</Link>
			</Form>
		</Container>
	);
};

export default LoginForm;
