export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Iterable: { input: any; output: any };
};

export type CrewMember = Node & {
  __typename?: 'CrewMember';
  id: Scalars['ID']['output'];
};

/** Cursor connection for CrewMember. */
export type CrewMemberCursorConnection = {
  __typename?: 'CrewMemberCursorConnection';
  edges?: Maybe<Array<Maybe<CrewMemberEdge>>>;
  pageInfo: CrewMemberPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of CrewMember. */
export type CrewMemberEdge = {
  __typename?: 'CrewMemberEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<CrewMember>;
};

/** Information about the current page. */
export type CrewMemberPageInfo = {
  __typename?: 'CrewMemberPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum CrewMemberStatusEnum {
  Dead = 'Dead',
  Free = 'Free',
  Jailed = 'Jailed',
}

export type Employee = Node & {
  __typename?: 'Employee';
  id: Scalars['ID']['output'];
};

/** Cursor connection for Employee. */
export type EmployeeCursorConnection = {
  __typename?: 'EmployeeCursorConnection';
  edges?: Maybe<Array<Maybe<EmployeeEdge>>>;
  pageInfo: EmployeePageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Employee. */
export type EmployeeEdge = {
  __typename?: 'EmployeeEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Employee>;
};

/** Information about the current page. */
export type EmployeePageInfo = {
  __typename?: 'EmployeePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum EmployeeStatusEnum {
  Active = 'Active',
  Pending = 'Pending',
}

export type Establishment = Node & {
  __typename?: 'Establishment';
  createdBy?: Maybe<User>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedBy?: Maybe<User>;
};

/** Cursor connection for Establishment. */
export type EstablishmentCursorConnection = {
  __typename?: 'EstablishmentCursorConnection';
  edges?: Maybe<Array<Maybe<EstablishmentEdge>>>;
  pageInfo: EstablishmentPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Establishment. */
export type EstablishmentEdge = {
  __typename?: 'EstablishmentEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Establishment>;
};

/** Information about the current page. */
export type EstablishmentPageInfo = {
  __typename?: 'EstablishmentPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Heist = Node & {
  __typename?: 'Heist';
  createdBy?: Maybe<User>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedBy?: Maybe<User>;
};

/** Cursor connection for Heist. */
export type HeistCursorConnection = {
  __typename?: 'HeistCursorConnection';
  edges?: Maybe<Array<Maybe<HeistEdge>>>;
  pageInfo: HeistPageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum HeistDifficultyEnum {
  Hard = 'Hard',
  Normal = 'Normal',
  Overkill = 'Overkill',
  VeryHard = 'VeryHard',
}

/** Edge of Heist. */
export type HeistEdge = {
  __typename?: 'HeistEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Heist>;
};

/** Information about the current page. */
export type HeistPageInfo = {
  __typename?: 'HeistPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum HeistPhaseEnum {
  Cancelled = 'Cancelled',
  Failed = 'Failed',
  InProgress = 'InProgress',
  Planning = 'Planning',
  Succeeded = 'Succeeded',
}

export enum HeistPreferedTacticEnum {
  Loud = 'Loud',
  SemiStealth = 'SemiStealth',
  Stealth = 'Stealth',
  Unknown = 'Unknown',
}

export enum HeistVisibilityEnum {
  Draft = 'Draft',
  Public = 'Public',
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Creates a CrewMember. */
  createCrewMember?: Maybe<CreateCrewMemberPayload>;
  /** Creates a Employee. */
  createEmployee?: Maybe<CreateEmployeePayload>;
  /** Creates a Establishment. */
  createEstablishment?: Maybe<CreateEstablishmentPayload>;
  /** Creates a Heist. */
  createHeist?: Maybe<CreateHeistPayload>;
  /** Creates a User. */
  createUser?: Maybe<CreateUserPayload>;
  /** Deletes a CrewMember. */
  deleteCrewMember?: Maybe<DeleteCrewMemberPayload>;
  /** Deletes a Employee. */
  deleteEmployee?: Maybe<DeleteEmployeePayload>;
  /** Deletes a Establishment. */
  deleteEstablishment?: Maybe<DeleteEstablishmentPayload>;
  /** Deletes a Heist. */
  deleteHeist?: Maybe<DeleteHeistPayload>;
  /** Deletes a User. */
  deleteUser?: Maybe<DeleteUserPayload>;
  /** Logins a User. */
  loginUser?: Maybe<LoginUserPayload>;
  /** Updates a CrewMember. */
  updateCrewMember?: Maybe<UpdateCrewMemberPayload>;
  /** Updates a Employee. */
  updateEmployee?: Maybe<UpdateEmployeePayload>;
  /** Updates a Establishment. */
  updateEstablishment?: Maybe<UpdateEstablishmentPayload>;
  /** Updates a Heist. */
  updateHeist?: Maybe<UpdateHeistPayload>;
  /** Updates a User. */
  updateUser?: Maybe<UpdateUserPayload>;
  /** Validates a User. */
  validateUser?: Maybe<ValidateUserPayload>;
};

export type MutationCreateCrewMemberArgs = {
  input: CreateCrewMemberInput;
};

export type MutationCreateEmployeeArgs = {
  input: CreateEmployeeInput;
};

export type MutationCreateEstablishmentArgs = {
  input: CreateEstablishmentInput;
};

export type MutationCreateHeistArgs = {
  input: CreateHeistInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationDeleteCrewMemberArgs = {
  input: DeleteCrewMemberInput;
};

export type MutationDeleteEmployeeArgs = {
  input: DeleteEmployeeInput;
};

export type MutationDeleteEstablishmentArgs = {
  input: DeleteEstablishmentInput;
};

export type MutationDeleteHeistArgs = {
  input: DeleteHeistInput;
};

export type MutationDeleteUserArgs = {
  input: DeleteUserInput;
};

export type MutationLoginUserArgs = {
  input: LoginUserInput;
};

export type MutationUpdateCrewMemberArgs = {
  input: UpdateCrewMemberInput;
};

export type MutationUpdateEmployeeArgs = {
  input: UpdateEmployeeInput;
};

export type MutationUpdateEstablishmentArgs = {
  input: UpdateEstablishmentInput;
};

export type MutationUpdateHeistArgs = {
  input: UpdateHeistInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationValidateUserArgs = {
  input: ValidateUserInput;
};

/** A node, according to the Relay specification. */
export type Node = {
  /** The id of this node. */
  id: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  crewMember?: Maybe<CrewMember>;
  crewMembers?: Maybe<CrewMemberCursorConnection>;
  employee?: Maybe<Employee>;
  employees?: Maybe<EmployeeCursorConnection>;
  establishment?: Maybe<Establishment>;
  establishments?: Maybe<EstablishmentCursorConnection>;
  heist?: Maybe<Heist>;
  heists?: Maybe<HeistCursorConnection>;
  meUser?: Maybe<User>;
  node?: Maybe<Node>;
  user?: Maybe<User>;
  users?: Maybe<UserCursorConnection>;
};

export type QueryCrewMemberArgs = {
  id: Scalars['ID']['input'];
};

export type QueryCrewMembersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryEmployeeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryEmployeesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryEstablishmentArgs = {
  id: Scalars['ID']['input'];
};

export type QueryEstablishmentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryHeistArgs = {
  id: Scalars['ID']['input'];
};

export type QueryHeistsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  crewMembers__user__id?: InputMaybe<Scalars['String']['input']>;
  employee__user__id?: InputMaybe<Scalars['String']['input']>;
  establishment__contractor__id?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  phase?: InputMaybe<Scalars['Iterable']['input']>;
};

export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

/** Cursor connection for User. */
export type UserCursorConnection = {
  __typename?: 'UserCursorConnection';
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  pageInfo: UserPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of User. */
export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<User>;
};

export enum UserLocaleEnum {
  En = 'En',
  Fr = 'Fr',
}

/** Information about the current page. */
export type UserPageInfo = {
  __typename?: 'UserPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum UserStatusEnum {
  Dead = 'Dead',
  Unverified = 'Unverified',
  Verified = 'Verified',
}

/** Creates a CrewMember. */
export type CreateCrewMemberInput = {
  civilianCasualties: Scalars['Int']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  heist: Scalars['String']['input'];
  kills: Scalars['Int']['input'];
  objectivesCompleted: Scalars['Int']['input'];
  payout: Scalars['Float']['input'];
  status: CrewMemberStatusEnum;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
  user: Scalars['String']['input'];
};

/** Creates a CrewMember. */
export type CreateCrewMemberNestedPayload = Node & {
  __typename?: 'createCrewMemberNestedPayload';
  civilianCasualties: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  heist: CreateHeistNestedPayload;
  id: Scalars['ID']['output'];
  kills: Scalars['Int']['output'];
  objectivesCompleted: Scalars['Int']['output'];
  payout: Scalars['Float']['output'];
  /** Will calculate the rating of the crew member for the heist depending on multiple factors. */
  rating: Scalars['Float']['output'];
  status: CrewMemberStatusEnum;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
  user: CreateUserNestedPayload;
};

/** Cursor connection for createCrewMemberNestedPayload. */
export type CreateCrewMemberNestedPayloadCursorConnection = {
  __typename?: 'createCrewMemberNestedPayloadCursorConnection';
  edges?: Maybe<Array<Maybe<CreateCrewMemberNestedPayloadEdge>>>;
  pageInfo: CreateCrewMemberNestedPayloadPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of createCrewMemberNestedPayload. */
export type CreateCrewMemberNestedPayloadEdge = {
  __typename?: 'createCrewMemberNestedPayloadEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<CreateCrewMemberNestedPayload>;
};

/** Information about the current page. */
export type CreateCrewMemberNestedPayloadPageInfo = {
  __typename?: 'createCrewMemberNestedPayloadPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Creates a CrewMember. */
export type CreateCrewMemberPayload = {
  __typename?: 'createCrewMemberPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  crewMember?: Maybe<CreateCrewMemberPayloadData>;
};

/** Creates a CrewMember. */
export type CreateCrewMemberPayloadData = Node & {
  __typename?: 'createCrewMemberPayloadData';
  civilianCasualties: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  heist: CreateHeistNestedPayload;
  id: Scalars['ID']['output'];
  kills: Scalars['Int']['output'];
  objectivesCompleted: Scalars['Int']['output'];
  payout: Scalars['Float']['output'];
  /** Will calculate the rating of the crew member for the heist depending on multiple factors. */
  rating: Scalars['Float']['output'];
  status: CrewMemberStatusEnum;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
  user: CreateUserNestedPayload;
};

/** Creates a Employee. */
export type CreateEmployeeInput = {
  allowedHeists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  establishment: Scalars['String']['input'];
  heists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  motivation?: InputMaybe<Scalars['String']['input']>;
  status: EmployeeStatusEnum;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
  weeklySchedule: Scalars['Iterable']['input'];
};

/** Creates a Employee. */
export type CreateEmployeeNestedPayload = Node & {
  __typename?: 'createEmployeeNestedPayload';
  allowedHeists?: Maybe<CreateHeistNestedPayloadCursorConnection>;
  codeName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  description?: Maybe<Scalars['String']['output']>;
  establishment: CreateEstablishmentNestedPayload;
  heists?: Maybe<CreateHeistNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status: EmployeeStatusEnum;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
  user?: Maybe<CreateUserNestedPayload>;
  weeklySchedule: Scalars['Iterable']['output'];
};

/** Cursor connection for createEmployeeNestedPayload. */
export type CreateEmployeeNestedPayloadCursorConnection = {
  __typename?: 'createEmployeeNestedPayloadCursorConnection';
  edges?: Maybe<Array<Maybe<CreateEmployeeNestedPayloadEdge>>>;
  pageInfo: CreateEmployeeNestedPayloadPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of createEmployeeNestedPayload. */
export type CreateEmployeeNestedPayloadEdge = {
  __typename?: 'createEmployeeNestedPayloadEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<CreateEmployeeNestedPayload>;
};

/** Information about the current page. */
export type CreateEmployeeNestedPayloadPageInfo = {
  __typename?: 'createEmployeeNestedPayloadPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Creates a Employee. */
export type CreateEmployeePayload = {
  __typename?: 'createEmployeePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<CreateEmployeePayloadData>;
};

/** Creates a Employee. */
export type CreateEmployeePayloadData = Node & {
  __typename?: 'createEmployeePayloadData';
  allowedHeists?: Maybe<CreateHeistNestedPayloadCursorConnection>;
  codeName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  description?: Maybe<Scalars['String']['output']>;
  establishment: CreateEstablishmentNestedPayload;
  heists?: Maybe<CreateHeistNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status: EmployeeStatusEnum;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
  user?: Maybe<CreateUserNestedPayload>;
  weeklySchedule: Scalars['Iterable']['output'];
};

/** Creates a Establishment. */
export type CreateEstablishmentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  contractor: Scalars['String']['input'];
  contractorCut: Scalars['Float']['input'];
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  crewCut: Scalars['Float']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  employeeCut: Scalars['Float']['input'];
  employees?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  heists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minimumWage: Scalars['Float']['input'];
  minimumWorkTimePerWeek: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
};

/** Creates a Establishment. */
export type CreateEstablishmentNestedPayload = Node & {
  __typename?: 'createEstablishmentNestedPayload';
  contractor: CreateUserNestedPayload;
  contractorCut: Scalars['Float']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  crewCut: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  employeeCut: Scalars['Float']['output'];
  employees?: Maybe<CreateEmployeeNestedPayloadCursorConnection>;
  heisterCut: Scalars['Float']['output'];
  heists?: Maybe<CreateHeistNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  minimumWage: Scalars['Float']['output'];
  minimumWorkTimePerWeek: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
};

/** Creates a Establishment. */
export type CreateEstablishmentPayload = {
  __typename?: 'createEstablishmentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<CreateEstablishmentPayloadData>;
};

/** Creates a Establishment. */
export type CreateEstablishmentPayloadData = Node & {
  __typename?: 'createEstablishmentPayloadData';
  contractor: CreateUserNestedPayload;
  contractorCut: Scalars['Float']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  crewCut: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  employeeCut: Scalars['Float']['output'];
  employees?: Maybe<CreateEmployeeNestedPayloadCursorConnection>;
  heisterCut: Scalars['Float']['output'];
  heists?: Maybe<CreateHeistNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  minimumWage: Scalars['Float']['output'];
  minimumWorkTimePerWeek: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
};

/** Creates a Heist. */
export type CreateHeistInput = {
  allowedEmployees?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  crewMembers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty: HeistDifficultyEnum;
  employee?: InputMaybe<Scalars['String']['input']>;
  endedAt?: InputMaybe<Scalars['String']['input']>;
  establishment: Scalars['String']['input'];
  forbiddenUsers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  maximumPayout: Scalars['Float']['input'];
  minimumPayout: Scalars['Float']['input'];
  minimumRequiredRating?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  objectives: Scalars['Iterable']['input'];
  phase: HeistPhaseEnum;
  preferedTactic: HeistPreferedTacticEnum;
  shouldEndAt: Scalars['String']['input'];
  startAt: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
  visibility: HeistVisibilityEnum;
};

/** Creates a Heist. */
export type CreateHeistNestedPayload = Node & {
  __typename?: 'createHeistNestedPayload';
  allowedEmployees?: Maybe<CreateEmployeeNestedPayloadCursorConnection>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  crewMembers?: Maybe<CreateCrewMemberNestedPayloadCursorConnection>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty: HeistDifficultyEnum;
  employee?: Maybe<CreateEmployeeNestedPayload>;
  endedAt?: Maybe<Scalars['String']['output']>;
  establishment: CreateEstablishmentNestedPayload;
  forbiddenUsers?: Maybe<CreateUserNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  maximumPayout: Scalars['Float']['output'];
  minimumPayout: Scalars['Float']['output'];
  minimumRequiredRating?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  objectiveCount: Scalars['Int']['output'];
  objectives: Scalars['Iterable']['output'];
  phase: HeistPhaseEnum;
  preferedTactic: HeistPreferedTacticEnum;
  requiredObjectiveCount: Scalars['Int']['output'];
  requiredObjectives: Scalars['Iterable']['output'];
  shouldEndAt: Scalars['String']['output'];
  startAt: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
  visibility: HeistVisibilityEnum;
};

/** Cursor connection for createHeistNestedPayload. */
export type CreateHeistNestedPayloadCursorConnection = {
  __typename?: 'createHeistNestedPayloadCursorConnection';
  edges?: Maybe<Array<Maybe<CreateHeistNestedPayloadEdge>>>;
  pageInfo: CreateHeistNestedPayloadPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of createHeistNestedPayload. */
export type CreateHeistNestedPayloadEdge = {
  __typename?: 'createHeistNestedPayloadEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<CreateHeistNestedPayload>;
};

/** Information about the current page. */
export type CreateHeistNestedPayloadPageInfo = {
  __typename?: 'createHeistNestedPayloadPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Creates a Heist. */
export type CreateHeistPayload = {
  __typename?: 'createHeistPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  heist?: Maybe<CreateHeistPayloadData>;
};

/** Creates a Heist. */
export type CreateHeistPayloadData = Node & {
  __typename?: 'createHeistPayloadData';
  allowedEmployees?: Maybe<CreateEmployeeNestedPayloadCursorConnection>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  crewMembers?: Maybe<CreateCrewMemberNestedPayloadCursorConnection>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty: HeistDifficultyEnum;
  employee?: Maybe<CreateEmployeeNestedPayload>;
  endedAt?: Maybe<Scalars['String']['output']>;
  establishment: CreateEstablishmentNestedPayload;
  forbiddenUsers?: Maybe<CreateUserNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  maximumPayout: Scalars['Float']['output'];
  minimumPayout: Scalars['Float']['output'];
  minimumRequiredRating?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  objectiveCount: Scalars['Int']['output'];
  objectives: Scalars['Iterable']['output'];
  phase: HeistPhaseEnum;
  preferedTactic: HeistPreferedTacticEnum;
  requiredObjectiveCount: Scalars['Int']['output'];
  requiredObjectives: Scalars['Iterable']['output'];
  shouldEndAt: Scalars['String']['output'];
  startAt: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
  visibility: HeistVisibilityEnum;
};

/** Creates a User. */
export type CreateUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  locale: UserLocaleEnum;
  plainPassword: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

/** Creates a User. */
export type CreateUserNestedPayload = Node & {
  __typename?: 'createUserNestedPayload';
  id: Scalars['ID']['output'];
};

/** Cursor connection for createUserNestedPayload. */
export type CreateUserNestedPayloadCursorConnection = {
  __typename?: 'createUserNestedPayloadCursorConnection';
  edges?: Maybe<Array<Maybe<CreateUserNestedPayloadEdge>>>;
  pageInfo: CreateUserNestedPayloadPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of createUserNestedPayload. */
export type CreateUserNestedPayloadEdge = {
  __typename?: 'createUserNestedPayloadEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<CreateUserNestedPayload>;
};

/** Information about the current page. */
export type CreateUserNestedPayloadPageInfo = {
  __typename?: 'createUserNestedPayloadPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Creates a User. */
export type CreateUserPayload = {
  __typename?: 'createUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<CreateUserPayloadData>;
};

/** Creates a User. */
export type CreateUserPayloadData = Node & {
  __typename?: 'createUserPayloadData';
  id: Scalars['ID']['output'];
};

/** Deletes a CrewMember. */
export type DeleteCrewMemberInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Deletes a CrewMember. */
export type DeleteCrewMemberPayload = {
  __typename?: 'deleteCrewMemberPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  crewMember?: Maybe<DeleteCrewMemberPayloadData>;
};

/** Deletes a CrewMember. */
export type DeleteCrewMemberPayloadData = Node & {
  __typename?: 'deleteCrewMemberPayloadData';
  id: Scalars['ID']['output'];
};

/** Deletes a Employee. */
export type DeleteEmployeeInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Deletes a Employee. */
export type DeleteEmployeePayload = {
  __typename?: 'deleteEmployeePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<DeleteEmployeePayloadData>;
};

/** Deletes a Employee. */
export type DeleteEmployeePayloadData = Node & {
  __typename?: 'deleteEmployeePayloadData';
  id: Scalars['ID']['output'];
};

/** Deletes a Establishment. */
export type DeleteEstablishmentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Deletes a Establishment. */
export type DeleteEstablishmentPayload = {
  __typename?: 'deleteEstablishmentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<DeleteEstablishmentPayloadData>;
};

/** Deletes a Establishment. */
export type DeleteEstablishmentPayloadData = Node & {
  __typename?: 'deleteEstablishmentPayloadData';
  id: Scalars['ID']['output'];
};

/** Deletes a Heist. */
export type DeleteHeistInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Deletes a Heist. */
export type DeleteHeistPayload = {
  __typename?: 'deleteHeistPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  heist?: Maybe<DeleteHeistPayloadData>;
};

/** Deletes a Heist. */
export type DeleteHeistPayloadData = Node & {
  __typename?: 'deleteHeistPayloadData';
  id: Scalars['ID']['output'];
};

/** Deletes a User. */
export type DeleteUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Deletes a User. */
export type DeleteUserPayload = {
  __typename?: 'deleteUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<DeleteUserPayloadData>;
};

/** Deletes a User. */
export type DeleteUserPayloadData = Node & {
  __typename?: 'deleteUserPayloadData';
  id: Scalars['ID']['output'];
};

/** Logins a User. */
export type LoginUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The password of the user to authenticate. */
  password: Scalars['String']['input'];
  /** The username of the user to authenticate. */
  username: Scalars['String']['input'];
};

/** Logins a User. */
export type LoginUserPayload = {
  __typename?: 'loginUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<LoginUserPayloadData>;
};

/** Logins a User. */
export type LoginUserPayloadData = Node & {
  __typename?: 'loginUserPayloadData';
  id: Scalars['ID']['output'];
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
};

/** Updates a CrewMember. */
export type UpdateCrewMemberInput = {
  civilianCasualties?: InputMaybe<Scalars['Int']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  heist?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  kills?: InputMaybe<Scalars['Int']['input']>;
  objectivesCompleted?: InputMaybe<Scalars['Int']['input']>;
  payout?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<CrewMemberStatusEnum>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
};

/** Updates a CrewMember. */
export type UpdateCrewMemberNestedPayload = Node & {
  __typename?: 'updateCrewMemberNestedPayload';
  civilianCasualties?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  heist?: Maybe<UpdateHeistNestedPayload>;
  id: Scalars['ID']['output'];
  kills?: Maybe<Scalars['Int']['output']>;
  objectivesCompleted?: Maybe<Scalars['Int']['output']>;
  payout?: Maybe<Scalars['Float']['output']>;
  /** Will calculate the rating of the crew member for the heist depending on multiple factors. */
  rating?: Maybe<Scalars['Float']['output']>;
  status?: Maybe<CrewMemberStatusEnum>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  user?: Maybe<UpdateUserNestedPayload>;
};

/** Cursor connection for updateCrewMemberNestedPayload. */
export type UpdateCrewMemberNestedPayloadCursorConnection = {
  __typename?: 'updateCrewMemberNestedPayloadCursorConnection';
  edges?: Maybe<Array<Maybe<UpdateCrewMemberNestedPayloadEdge>>>;
  pageInfo: UpdateCrewMemberNestedPayloadPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of updateCrewMemberNestedPayload. */
export type UpdateCrewMemberNestedPayloadEdge = {
  __typename?: 'updateCrewMemberNestedPayloadEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<UpdateCrewMemberNestedPayload>;
};

/** Information about the current page. */
export type UpdateCrewMemberNestedPayloadPageInfo = {
  __typename?: 'updateCrewMemberNestedPayloadPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Updates a CrewMember. */
export type UpdateCrewMemberPayload = {
  __typename?: 'updateCrewMemberPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  crewMember?: Maybe<UpdateCrewMemberPayloadData>;
};

/** Updates a CrewMember. */
export type UpdateCrewMemberPayloadData = Node & {
  __typename?: 'updateCrewMemberPayloadData';
  civilianCasualties?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  heist?: Maybe<UpdateHeistNestedPayload>;
  id: Scalars['ID']['output'];
  kills?: Maybe<Scalars['Int']['output']>;
  objectivesCompleted?: Maybe<Scalars['Int']['output']>;
  payout?: Maybe<Scalars['Float']['output']>;
  /** Will calculate the rating of the crew member for the heist depending on multiple factors. */
  rating?: Maybe<Scalars['Float']['output']>;
  status?: Maybe<CrewMemberStatusEnum>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  user?: Maybe<UpdateUserNestedPayload>;
};

/** Updates a Employee. */
export type UpdateEmployeeInput = {
  allowedHeists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  establishment?: InputMaybe<Scalars['String']['input']>;
  heists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id: Scalars['ID']['input'];
  motivation?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EmployeeStatusEnum>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
  weeklySchedule?: InputMaybe<Scalars['Iterable']['input']>;
};

/** Updates a Employee. */
export type UpdateEmployeeNestedPayload = Node & {
  __typename?: 'updateEmployeeNestedPayload';
  allowedHeists?: Maybe<UpdateHeistNestedPayloadCursorConnection>;
  codeName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  description?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<UpdateEstablishmentNestedPayload>;
  heists?: Maybe<UpdateHeistNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EmployeeStatusEnum>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  user?: Maybe<UpdateUserNestedPayload>;
  weeklySchedule?: Maybe<Scalars['Iterable']['output']>;
};

/** Cursor connection for updateEmployeeNestedPayload. */
export type UpdateEmployeeNestedPayloadCursorConnection = {
  __typename?: 'updateEmployeeNestedPayloadCursorConnection';
  edges?: Maybe<Array<Maybe<UpdateEmployeeNestedPayloadEdge>>>;
  pageInfo: UpdateEmployeeNestedPayloadPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of updateEmployeeNestedPayload. */
export type UpdateEmployeeNestedPayloadEdge = {
  __typename?: 'updateEmployeeNestedPayloadEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<UpdateEmployeeNestedPayload>;
};

/** Information about the current page. */
export type UpdateEmployeeNestedPayloadPageInfo = {
  __typename?: 'updateEmployeeNestedPayloadPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Updates a Employee. */
export type UpdateEmployeePayload = {
  __typename?: 'updateEmployeePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<UpdateEmployeePayloadData>;
};

/** Updates a Employee. */
export type UpdateEmployeePayloadData = Node & {
  __typename?: 'updateEmployeePayloadData';
  allowedHeists?: Maybe<UpdateHeistNestedPayloadCursorConnection>;
  codeName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  description?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<UpdateEstablishmentNestedPayload>;
  heists?: Maybe<UpdateHeistNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EmployeeStatusEnum>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  user?: Maybe<UpdateUserNestedPayload>;
  weeklySchedule?: Maybe<Scalars['Iterable']['output']>;
};

/** Updates a Establishment. */
export type UpdateEstablishmentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  contractor?: InputMaybe<Scalars['String']['input']>;
  contractorCut?: InputMaybe<Scalars['Float']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  crewCut?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  employeeCut?: InputMaybe<Scalars['Float']['input']>;
  employees?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  heists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id: Scalars['ID']['input'];
  minimumWage?: InputMaybe<Scalars['Float']['input']>;
  minimumWorkTimePerWeek?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
};

/** Updates a Establishment. */
export type UpdateEstablishmentNestedPayload = Node & {
  __typename?: 'updateEstablishmentNestedPayload';
  contractor?: Maybe<UpdateUserNestedPayload>;
  contractorCut?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  crewCut?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  employeeCut?: Maybe<Scalars['Float']['output']>;
  employees?: Maybe<UpdateEmployeeNestedPayloadCursorConnection>;
  heisterCut?: Maybe<Scalars['Float']['output']>;
  heists?: Maybe<UpdateHeistNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  minimumWage?: Maybe<Scalars['Float']['output']>;
  minimumWorkTimePerWeek?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
};

/** Cursor connection for updateEstablishmentNestedPayload. */
export type UpdateEstablishmentNestedPayloadCursorConnection = {
  __typename?: 'updateEstablishmentNestedPayloadCursorConnection';
  edges?: Maybe<Array<Maybe<UpdateEstablishmentNestedPayloadEdge>>>;
  pageInfo: UpdateEstablishmentNestedPayloadPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of updateEstablishmentNestedPayload. */
export type UpdateEstablishmentNestedPayloadEdge = {
  __typename?: 'updateEstablishmentNestedPayloadEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<UpdateEstablishmentNestedPayload>;
};

/** Information about the current page. */
export type UpdateEstablishmentNestedPayloadPageInfo = {
  __typename?: 'updateEstablishmentNestedPayloadPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Updates a Establishment. */
export type UpdateEstablishmentPayload = {
  __typename?: 'updateEstablishmentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<UpdateEstablishmentPayloadData>;
};

/** Updates a Establishment. */
export type UpdateEstablishmentPayloadData = Node & {
  __typename?: 'updateEstablishmentPayloadData';
  contractor?: Maybe<UpdateUserNestedPayload>;
  contractorCut?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  crewCut?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  employeeCut?: Maybe<Scalars['Float']['output']>;
  employees?: Maybe<UpdateEmployeeNestedPayloadCursorConnection>;
  heisterCut?: Maybe<Scalars['Float']['output']>;
  heists?: Maybe<UpdateHeistNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  minimumWage?: Maybe<Scalars['Float']['output']>;
  minimumWorkTimePerWeek?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
};

/** Updates a Heist. */
export type UpdateHeistInput = {
  allowedEmployees?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  crewMembers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<HeistDifficultyEnum>;
  employee?: InputMaybe<Scalars['String']['input']>;
  endedAt?: InputMaybe<Scalars['String']['input']>;
  establishment?: InputMaybe<Scalars['String']['input']>;
  forbiddenUsers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id: Scalars['ID']['input'];
  maximumPayout?: InputMaybe<Scalars['Float']['input']>;
  minimumPayout?: InputMaybe<Scalars['Float']['input']>;
  minimumRequiredRating?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  objectives?: InputMaybe<Scalars['Iterable']['input']>;
  phase?: InputMaybe<HeistPhaseEnum>;
  preferedTactic?: InputMaybe<HeistPreferedTacticEnum>;
  shouldEndAt?: InputMaybe<Scalars['String']['input']>;
  startAt?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<HeistVisibilityEnum>;
};

/** Updates a Heist. */
export type UpdateHeistNestedPayload = Node & {
  __typename?: 'updateHeistNestedPayload';
  allowedEmployees?: Maybe<UpdateEmployeeNestedPayloadCursorConnection>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  crewMembers?: Maybe<UpdateCrewMemberNestedPayloadCursorConnection>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<HeistDifficultyEnum>;
  employee?: Maybe<UpdateEmployeeNestedPayload>;
  endedAt?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<UpdateEstablishmentNestedPayload>;
  forbiddenUsers?: Maybe<UpdateUserNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  maximumPayout?: Maybe<Scalars['Float']['output']>;
  minimumPayout?: Maybe<Scalars['Float']['output']>;
  minimumRequiredRating?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  objectiveCount?: Maybe<Scalars['Int']['output']>;
  objectives?: Maybe<Scalars['Iterable']['output']>;
  phase?: Maybe<HeistPhaseEnum>;
  preferedTactic?: Maybe<HeistPreferedTacticEnum>;
  requiredObjectiveCount?: Maybe<Scalars['Int']['output']>;
  requiredObjectives?: Maybe<Scalars['Iterable']['output']>;
  shouldEndAt?: Maybe<Scalars['String']['output']>;
  startAt?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  visibility?: Maybe<HeistVisibilityEnum>;
};

/** Cursor connection for updateHeistNestedPayload. */
export type UpdateHeistNestedPayloadCursorConnection = {
  __typename?: 'updateHeistNestedPayloadCursorConnection';
  edges?: Maybe<Array<Maybe<UpdateHeistNestedPayloadEdge>>>;
  pageInfo: UpdateHeistNestedPayloadPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of updateHeistNestedPayload. */
export type UpdateHeistNestedPayloadEdge = {
  __typename?: 'updateHeistNestedPayloadEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<UpdateHeistNestedPayload>;
};

/** Information about the current page. */
export type UpdateHeistNestedPayloadPageInfo = {
  __typename?: 'updateHeistNestedPayloadPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Updates a Heist. */
export type UpdateHeistPayload = {
  __typename?: 'updateHeistPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  heist?: Maybe<UpdateHeistPayloadData>;
};

/** Updates a Heist. */
export type UpdateHeistPayloadData = Node & {
  __typename?: 'updateHeistPayloadData';
  allowedEmployees?: Maybe<UpdateEmployeeNestedPayloadCursorConnection>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  crewMembers?: Maybe<UpdateCrewMemberNestedPayloadCursorConnection>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<HeistDifficultyEnum>;
  employee?: Maybe<UpdateEmployeeNestedPayload>;
  endedAt?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<UpdateEstablishmentNestedPayload>;
  forbiddenUsers?: Maybe<UpdateUserNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  maximumPayout?: Maybe<Scalars['Float']['output']>;
  minimumPayout?: Maybe<Scalars['Float']['output']>;
  minimumRequiredRating?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  objectiveCount?: Maybe<Scalars['Int']['output']>;
  objectives?: Maybe<Scalars['Iterable']['output']>;
  phase?: Maybe<HeistPhaseEnum>;
  preferedTactic?: Maybe<HeistPreferedTacticEnum>;
  requiredObjectiveCount?: Maybe<Scalars['Int']['output']>;
  requiredObjectives?: Maybe<Scalars['Iterable']['output']>;
  shouldEndAt?: Maybe<Scalars['String']['output']>;
  startAt?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  visibility?: Maybe<HeistVisibilityEnum>;
};

/** Updates a User. */
export type UpdateUserInput = {
  balance?: InputMaybe<Scalars['Float']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  crewMembers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  email?: InputMaybe<Scalars['String']['input']>;
  employee?: InputMaybe<Scalars['String']['input']>;
  establishments?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  forbiddenHeists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  locale?: InputMaybe<UserLocaleEnum>;
  plainPassword?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Scalars['Iterable']['input']>;
  status?: InputMaybe<UserStatusEnum>;
  token?: InputMaybe<Scalars['String']['input']>;
  tokenTtl?: InputMaybe<Scalars['Int']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** Updates a User. */
export type UpdateUserNestedPayload = Node & {
  __typename?: 'updateUserNestedPayload';
  allowedRoles?: Maybe<Scalars['Iterable']['output']>;
  balance?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  crewMembers?: Maybe<UpdateCrewMemberNestedPayloadCursorConnection>;
  email?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<UpdateEmployeeNestedPayload>;
  establishments?: Maybe<UpdateEstablishmentNestedPayloadCursorConnection>;
  forbiddenHeists?: Maybe<UpdateHeistNestedPayloadCursorConnection>;
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale?: Maybe<UserLocaleEnum>;
  mutuallyExclusiveRoles?: Maybe<Scalars['Iterable']['output']>;
  plainPassword?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Scalars['Iterable']['output']>;
  status?: Maybe<UserStatusEnum>;
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  /** A visual identifier that represents this user. */
  userIdentifier?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for updateUserNestedPayload. */
export type UpdateUserNestedPayloadCursorConnection = {
  __typename?: 'updateUserNestedPayloadCursorConnection';
  edges?: Maybe<Array<Maybe<UpdateUserNestedPayloadEdge>>>;
  pageInfo: UpdateUserNestedPayloadPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of updateUserNestedPayload. */
export type UpdateUserNestedPayloadEdge = {
  __typename?: 'updateUserNestedPayloadEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<UpdateUserNestedPayload>;
};

/** Information about the current page. */
export type UpdateUserNestedPayloadPageInfo = {
  __typename?: 'updateUserNestedPayloadPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Updates a User. */
export type UpdateUserPayload = {
  __typename?: 'updateUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<UpdateUserPayloadData>;
};

/** Updates a User. */
export type UpdateUserPayloadData = Node & {
  __typename?: 'updateUserPayloadData';
  allowedRoles?: Maybe<Scalars['Iterable']['output']>;
  balance?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  crewMembers?: Maybe<UpdateCrewMemberNestedPayloadCursorConnection>;
  email?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<UpdateEmployeeNestedPayload>;
  establishments?: Maybe<UpdateEstablishmentNestedPayloadCursorConnection>;
  forbiddenHeists?: Maybe<UpdateHeistNestedPayloadCursorConnection>;
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale?: Maybe<UserLocaleEnum>;
  mutuallyExclusiveRoles?: Maybe<Scalars['Iterable']['output']>;
  plainPassword?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Scalars['Iterable']['output']>;
  status?: Maybe<UserStatusEnum>;
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  /** A visual identifier that represents this user. */
  userIdentifier?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** Validates a User. */
export type ValidateUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status: UserStatusEnum;
};

/** Validates a User. */
export type ValidateUserPayload = {
  __typename?: 'validateUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<ValidateUserPayloadData>;
};

/** Validates a User. */
export type ValidateUserPayloadData = Node & {
  __typename?: 'validateUserPayloadData';
  balance: Scalars['Float']['output'];
  email: Scalars['String']['output'];
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  roles: Scalars['Iterable']['output'];
  username: Scalars['String']['output'];
};
