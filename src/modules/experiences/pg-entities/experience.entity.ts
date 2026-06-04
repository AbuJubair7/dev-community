import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('experiences')
export class ExperienceEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  _id!: string;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  @Column({ type: 'varchar', nullable: false })
  companyName!: string;

  @Column({ type: 'varchar', nullable: false })
  role!: string;

  @Column({ type: 'timestamp', nullable: false })
  startDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'varchar', nullable: true })
  description?: string;
}
