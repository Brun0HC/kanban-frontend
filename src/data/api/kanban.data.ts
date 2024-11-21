import { ICard } from "@/interface/card.interface";
import { IColumn } from "@/interface/column.interface";
import { IKanban } from "@/interface/kanban.interace";
import { IMember } from "@/interface/member.interface";
import { faker } from "@faker-js/faker";

export const memberData: IMember[] = Array.from({ length: 1 }, (_, index) => ({
  id: index,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
}));

export const kanbanData: IKanban[] = Array.from({ length: 10 }, (_, index) => ({
  id: index,
  name: faker.lorem.words(),
  image: faker.image.avatar(),
  idMemberCreator: {
    id: Math.floor(1 * Math.random()),
  },
}));

const cardData: () => ICard[] = () =>
  Array.from({ length: 2 }, (_, index) => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(),
    textDescription: faker.lorem.paragraph(),
    idMemberCreator: {
      id: Math.floor(1 * Math.random()),
    },
    column: {
      id: Math.floor(10 * Math.random()),
    },
    position: index + 1,
  }));

export const columnData: () => IColumn[] = () =>
  Array.from({ length: 2 }, (_, index) => ({
    id: faker.string.uuid(),
    name: faker.lorem.words(),
    idKanban: {
      id: Math.floor(10 * Math.random()),
    },
    position: index + 1,
    cards: cardData(),
  }));
