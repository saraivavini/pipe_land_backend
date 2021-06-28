import { startOfDay } from "date-fns";
import { inject, injectable } from "tsyringe";

import { IAttendancesRepository } from "@modules/classes/repositories/IAttendancesRepository";
import { IClassesRepository } from "@modules/classes/repositories/IClassesRepository";
import { IStudentsRepository } from "@modules/classes/repositories/IStudentsRepository";
import { AppError } from "@shared/errors/AppError";

interface IRequest {
  logged_user_id: string;
  date: string;
  class_id: string;
}

type IResponse = Array<{
  id: string | undefined;
  name: string;
  photo?: string | undefined;
  is_present: boolean;
  date: Date;
  class_id: string;
  student_id: string;
}>;

@injectable()
class FindDayAttendanceListUseCase {
  constructor(
    @inject("AttendancesRepository")
    private attendancesRepository: IAttendancesRepository,
    @inject("ClassesRepository")
    private classesRepository: IClassesRepository,
    @inject("StudentsRepository")
    private studentsRepository: IStudentsRepository
  ) {}

  async execute({
    logged_user_id,
    class_id,
    date,
  }: IRequest): Promise<IResponse> {
    const findClass = await this.classesRepository.findById(class_id);
    const formatedDate = startOfDay(new Date(date));

    if (!findClass) {
      throw new AppError("Turma não encontrada!", 404);
    }

    if (findClass.teacher_id !== logged_user_id) {
      throw new AppError("Você não tem autorização para fazer isso", 401);
    }

    const findAttendances = await this.attendancesRepository.findAllByClassIdAndDate(
      {
        class_id,
        date: formatedDate,
      }
    );

    if (!findAttendances.length) {
      const findStudents = await this.studentsRepository.findAllByClassId(
        class_id
      );

      const formatResponse = findStudents.map((student) => {
        return {
          id: undefined,
          name: student?.nickname || student?.user.name || "",
          photo: student?.photo,
          is_present: true,
          date: formatedDate,
          class_id: student.class_id,
          student_id: student.id,
        };
      });

      return formatResponse;
    }

    const formatResponse = findAttendances.map((attendance) => {
      return {
        id: attendance.id,
        name:
          attendance.student?.nickname || attendance.student?.user.name || "",
        photo: attendance.student?.photo,
        is_present: attendance.is_present,
        date: attendance.date,
        class_id: attendance.class_id,
        student_id: attendance.student_id,
      };
    });

    return formatResponse;
  }
}

export { FindDayAttendanceListUseCase };