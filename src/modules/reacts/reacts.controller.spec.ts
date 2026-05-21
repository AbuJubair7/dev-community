import { Test, TestingModule } from '@nestjs/testing';
import { ReactsController } from './reacts.controller';
import { ReactsService } from './reacts.service';

describe('ReactsController', () => {
  let controller: ReactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactsController],
      providers: [ReactsService],
    }).compile();

    controller = module.get<ReactsController>(ReactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
