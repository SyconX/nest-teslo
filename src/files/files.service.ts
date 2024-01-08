import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {

    getImage(imageName: string) {
        const path = join(__dirname, '..', '..', 'static', 'products', imageName);
        if ( !existsSync(path) ) 
            throw new BadRequestException( `Image ${imageName} not found`);
        return path;
    }

}
