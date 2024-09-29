import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { HomeService } from './services/home.service';
import { FormsModule } from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    MatTableModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HomeRoutingModule,
    MatButtonModule,
    CarouselModule,
    MatDividerModule,
    TagModule,
    ButtonModule
  ],
  providers: [HomeService]
})
export class HomeModule { }