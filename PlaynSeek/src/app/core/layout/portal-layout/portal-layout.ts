import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Importamos la navbar para poder usarla dentro de este layout
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.scss',
})
export class PortalLayout {}