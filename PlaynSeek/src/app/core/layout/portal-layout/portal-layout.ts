import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Importamos la navbar para poder usarla dentro de este layout
import { Navbar } from '../navbar/navbar';


@Component({
  selector: 'app-portal-layout',
  imports: [RouterOutlet, Navbar ],       
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.scss',
})
export class PortalLayout {}