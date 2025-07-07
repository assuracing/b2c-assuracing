import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { VehicleService } from '../../../services/vehicle.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

interface Circuit {
  id: number;
  nom: string;
  adresseCircuit: string;
  responsablePiste: string;
  mailResponsablePiste: string;
  pays: string;
}

@Component({
  selector: 'app-vehicle-info',
  templateUrl: './vehicle-info.component.html',
  styleUrls: ['./vehicle-info.component.scss', '../../../app.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatTooltipModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatOptionModule]
})
export class VehicleInfoComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Output() vehicleAdded = new EventEmitter<any>();
  @Output() vehicleRemoved = new EventEmitter<any>();
  vehicles: any[] = [];
  vehicleTypes = [
    { value: 'auto', label: 'Auto' },
    { value: 'moto', label: 'Moto' }
  ];
  @ViewChild('stepper') stepper!: MatStepper;
  private subscription?: Subscription;

  licenseTypes: Record<'auto' | 'moto', { value: string; label: string }[]> = {
    auto: [
      { value: 'permis_b', label: 'Permis B' },
      { value: 'licence_ffsa', label: 'Licence FFSA' }
    ],
    moto: [
      { value: 'permis_a', label: 'Permis A' },
      { value: 'casm', label: 'CASM' }
    ]
  };

  brands: Record<'auto' | 'moto', string[]> = {
    auto: [
      'ALFA', 'ALFA ROMEO', 'ALPINE', 'AMG', 'ARIEL', 'ARO', 'ASTON MARTIN', 'AUDI', 'AUSTIN HEALEY',
      'AUVERLAND', 'BMW', 'BUGATTI', 'CADILLAC', 'CATERHAM', 'CHEVROLET', 'CHRYSLER', 'CITROEN',
      'DACIA', 'DAEWOO', 'DAIHATSU', 'DANGEL', 'DODGE', 'DONKERVOORT', 'FERRARI', 'FIAT', 'FORD',
      'FUNYO', 'GMC', 'HONDA', 'HUMMER', 'HYUNDAI', 'INFINITI', 'ISUZU', 'JAGUAR', 'JEEP', 'JEMA',
      'KIA', 'KTM', 'LADA', 'LAMBORGHINI', 'LANCIA', 'LAND ROVER', 'LEGENDS CARS', 'LEXUS', 'LOTUS',
      'MAHINDRA', 'MASERATI', 'MAZDA', 'MC LAREN', 'MERCEDES', 'MERCEDES-BENZ', 'MG', 'MINI', 'MITJET',
      'MITSUBISHI', 'MORGAN', 'NISSAN', 'NORMA', 'OPEL', 'ORION', 'PERFORMER', 'PEUGEOT', 'PONTIAC',
      'PORSCHE', "PREDATOR'S", 'PROTON', 'RADICAL', 'RENAULT', 'ROVER', 'SAAB', 'SAKER', 'SANTANA',
      'SEAT', 'SECMA', 'SIMCA', 'SKODA', 'SMART', 'SSANGYONG', 'SUBARU', 'SUZUKI', 'TESLA', 'TOYOTA',
      'TRIUMPH', 'ULTIMA GTR', 'VENTURI', 'VENTURINI', 'VOLKSWAGEN', 'VOLVO', 'WESTFIELD', 'AUTRE'
    ],
    moto: [
      'HONDA', 'KAWASAKI', 'SUZUKI', 'YAMAHA', 'TRIUMPH', 'DUCATI', 'BMW', 'ACM', 'ACMA', 'ADIVA',
      'ADLY', 'ADV', 'AJP', 'ANCILLOTTI', 'APOLLO', 'APRILIA', 'ARDILA', 'ASA', 'ASTROM', 'ASYA',
      'ATM', 'AUPAMOTOR', 'AUTOMOTO', 'AXR', 'BAJAJ', 'BAOTIAN', 'BENELLI', 'BENZHOU', 'BERTAUX',
      'BETA', 'BFG', 'BHM', 'BIANCHI MOTOR SPORT', 'BIMOTA', 'BISAN', 'BLATA', 'BMW ENDURO', 'BOOXT',
      'BORILE', 'BOWEL', 'BOXER', 'BPS', 'BSA', 'BSM', 'BUCCI', 'BUELL', 'CAGIVA', 'CANNONDALE',
      'CARDEL', 'CC', 'CCM', 'CF MOTO', 'CH RACING', 'CHANG JIANG', 'CHRONO', 'CHUANL', 'CHUNFENG',
      'CHUNLAN', 'CLIMAX', 'CLIPIC', 'CONTI MOTORS', 'CPI', 'CR&S', 'CRZ', 'DADO MOTORS', 'DAELIM',
      'DAFIER', 'DAYUN', 'DERBI', 'DF LONG', 'DIAPASON', 'EASYSCOOT', 'EGLI ROTAX', 'EMEISHAN',
      'ENFIELD', 'ESTRADA', 'EUROCKA', 'EYLIPSE', 'FALCONBIKE', 'FANTIC MOTOR', 'FEILING', 'FOSTI',
      'FYM', 'GAS GAS', 'GEELY', 'GENERIC', 'GIANTCO', 'GILERA', 'GIMA', 'GINELLI', 'GOES', 'GOWINN',
      'GUOBEN', 'HAIZHIMENG', 'HANGLONG', 'HARLEY DAVIDSON', 'HARTFORD', 'HEROWAY', 'HIGHLAND', 'HM',
      'HM HONDA', 'HM-HONDA', 'HONGYI', 'HONLEI', 'HOOPER', 'HRD', 'HSUN', 'HUATIAN', 'HUAWIN',
      'HUONIAO', 'HUSABERG', 'HUSQVARNA', 'HYOSUNG', 'ICHIBAN', 'ITALJET', 'JAMES B', 'JAWA', 'JAXIN',
      'JETSTAR', 'JIALING', 'JIANSHE', 'JINCHENG', 'JINLUN', 'JLD', 'JMSTAR', 'JONWAY', 'KAITHAM',
      'KAITONG MOTOR', 'KEEWAY', 'KINLON', 'KINROAD', 'KL', 'KRAM IT', 'KRAMER', 'KREIDLER', 'KTM',
      'KUDAKI', 'KYMCO', 'LAVERDA', 'LBC', 'LEDOW', 'LEIKE', 'LEONART', 'LEONE', 'LIFAN', 'LIFANG',
      'LINGBEN', 'LINGYUAN', 'LINGYUN', 'LINHAI', 'LML', 'LONCIN', 'LONGBO', 'LONGJIA', 'MAICO',
      'MALAGUTI', 'MASAI', 'MBK', 'MCC', 'MEGELLI', 'MEIDUO', 'MEIDUO MOTOR', 'MH MOTORHISPANIA',
      'MINICO', 'MISTRAL', 'MONNIER', 'MONTESA', 'MORINI', 'MORS', 'MORVAN', 'MOTO FRANCAISE',
      'MOTO GUZZI', 'MOTO MORINI', 'MOTO ZETA', 'MOTOBECANE', 'MOTORBIKE', 'MPI', 'MUZ', 'MV AGUSTA',
      'MZ', 'NERVE', 'NEWTEAM', 'NIMIZI', 'NIPPONIA', 'NORTON', 'OXO BIKE', 'PAGSTA', 'PEDA', 'PEM DA',
      'PEUGEOT', 'PFM', 'PGO', 'PIAGGIO', 'PIONEER', 'POLINI PANTERA', 'PREGO', 'PRO COMPOSITE',
      'QINGQI', 'QIPAI', 'RAZZO', 'REGAL RAPTOR', 'RENAULT', 'REVATTO', 'RIEJU', 'RIVAL', 'ROADBIKE',
      'ROADSIGN', 'ROBY BIKE', 'ROYAL ENFIELD', 'SACHS', 'SACIN', 'SANBEN', 'SAXON', 'SCAPA', 'SCORPA',
      'SELECT UP', 'SHANGBEN', 'SHE-LUNG', 'SHENKE', 'SHERCO', 'SHINERAY', 'SIAMOTO', 'SKY TEAM',
      'SPIGAOU', 'STEY', 'SUKIDA', 'SUMCO', 'SV', 'SWM', 'SYM', 'TAURIS', 'TENDANCE', 'TGB', 'TGM',
      'THUMP', 'TM', 'TNT MOTOR', 'TOMOS', 'UNIVERSAL BIKE', 'URAL', 'VALENTI', 'VASTRO', 'VENTO',
      'VERTEMATI', 'VINCENT', 'VONROAD', 'VOR', 'VOXAN', 'WACOX', 'WANGYE', 'WUBEN', 'XGJAO', 'XINGYUE',
      'XINLING', 'XINTIAN', 'XR DALL ARA', 'YAZUKA', 'YBEN', 'YCF', 'YIBEN', 'YIYING', 'YUAN', 'ZHENHUA',
      'ZHONGNENG', 'ZHONGYU', 'ZIP STAR', 'ZNEN', 'ZONGSHEN', 'AUTRE'
    ]
  };

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.subscription = this.vehicleService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
    });

    this.form.get('type')?.valueChanges.subscribe(() => {
      this.form.get('brand')?.reset();
      this.form.get('titreConduite')?.reset();
    });
  }



  getFilteredBrands(): string[] {
    const type = this.form.get('type')?.value;
    return this.brands[type as keyof typeof this.brands] || [];
  }

  getFilteredLicenseTypes(): { value: string; label: string }[] {
    const type = this.form.get('type')?.value;
    return this.licenseTypes[type as keyof typeof this.licenseTypes] || [];
  }

  addVehicle() {
    if (this.form.valid) {
      const vehicle = {
        type: this.form.get('type')?.value,
        brand: this.form.get('brand')?.value,
        model: this.form.get('model')?.value,
        identificationNumber: this.form.get('identificationNumber')?.value,
        immatNumber: this.form.get('immatNumber')?.value,
        chassisNumber: this.form.get('chassisNumber')?.value,
        serieNumber: this.form.get('serieNumber')?.value,
        titreConduite: this.form.get('titreConduite')?.value,
        titreNumber: this.form.get('titreNumber')?.value
      };
      
      this.vehicleService.addVehicle(vehicle);
      this.vehicleAdded.emit(vehicle);
      
      this.form.reset();
      this.form.patchValue({
        identificationNumber: 'immat'
      });
    }
  }

  saveAndContinue() {
    if (this.form.valid) {
      this.addVehicle();
      this.stepper.next();
    }
  }

  removeVehicle(index: number) {
    const removedVehicle = this.vehicles[index];
    this.vehicleService.removeVehicle(index);
    this.vehicleRemoved.emit(removedVehicle);
  }

  onSaveVehicle() {
    const vehicle = this.form.value;
    this.vehicleAdded.emit(vehicle);
    this.resetFormAfterAdd();
  }

  resetFormAfterAdd() {
    this.form.reset();
    this.form.patchValue({
      identificationNumber: 'immat',
    });
  }

  resetForm() {
    this.form.reset();
    this.form.patchValue({
      identificationNumber: 'immat'
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
