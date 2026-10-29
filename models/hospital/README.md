# Modelos 3D del Hospital de Puerto Aysén (.GLB / .GLTF)

Coloca aquí tus modelos 3D exportados desde Blender, SketchUp, Revit o SweetHome3D:

## Opciones de carga automática:
1. **Modelo Completo**:
   - `models/hospital/hospital.glb` (o `hospital_interior.glb`): Modelo completo del hospital.
2. **Modelos por Piso (Recomendado para trabajar por etapas)**:
   - `models/hospital/subterraneo.glb`: Nivel -1 (Calderas, Gases, Tableros, Mantención)
   - `models/hospital/piso1.glb`: Piso 1 (SOME, Admisión, Rayos X, Urgencias SAMU)
   - `models/hospital/piso2.glb`: Piso 2 (14 Boxes Médicos, Clínica Dental, Kinesiología)
   - `models/hospital/piso3.glb`: Piso 3 (Hospitalización, UTI, Neonatología, Esterilización)

## Configuración de Exportación en Blender / SketchUp:
- **Formato**: glTF 2.0 Binary (`.glb`)
- **Ejes**: +Y Up (Arriba), -Z Forward (Adelante)
- **Escala**: 1 unidad = 1 metro
- **Materiales**: Nombra los materiales para asignación automática PBR:
  - `Muro_*` o `Pared_*`: Se le aplica concreto/yeso mate PBR.
  - `Piso_*` o `Suelo_*`: Se le aplica vinilo/baldosa hospitalaria reflectante.
  - `Vidrio_*` o `Cristal_*`: Se le aplica vidrio transparente PBR con refracción.
  - `Metal_*` o `Acero_*`: Se le aplica acero inoxidable satinado.
