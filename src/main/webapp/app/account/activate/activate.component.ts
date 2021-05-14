import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mergeMap } from 'rxjs/operators';

import { LoginRouteService } from 'app/core/login/route-login.service';
import { ActivateService } from './activate.service';

@Component({
  selector: 'jhi-activate',
  templateUrl: './activate.component.html',
})
export class ActivateComponent implements OnInit {
  error = false;
  success = false;

  constructor(private activateService: ActivateService, private loginRouteService: LoginRouteService, private route: ActivatedRoute) {}
  constructor(private activateService: ActivateService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(mergeMap(params => this.activateService.get(params.key))).subscribe(
      () => (this.success = true),
      () => (this.error = true)
    );
  }

  login(): void {
    this.loginRouteService.open();
  }
}
