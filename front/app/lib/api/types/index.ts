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

export type ContractorRequest = Node & {
  __typename?: 'ContractorRequest';
  adminComment?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  reason: Scalars['String']['output'];
  status: ContractorRequestStatusEnum;
};

/** Cursor connection for ContractorRequest. */
export type ContractorRequestCursorConnection = {
  __typename?: 'ContractorRequestCursorConnection';
  edges?: Maybe<Array<Maybe<ContractorRequestEdge>>>;
  pageInfo: ContractorRequestPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of ContractorRequest. */
export type ContractorRequestEdge = {
  __typename?: 'ContractorRequestEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<ContractorRequest>;
};

/** Information about the current page. */
export type ContractorRequestPageInfo = {
  __typename?: 'ContractorRequestPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum ContractorRequestStatusEnum {
  Accepted = 'Accepted',
  Pending = 'Pending',
  Rejected = 'Rejected',
}

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
  codeName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  establishment: Establishment;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EmployeeStatusEnum>;
  user?: Maybe<UserItem>;
  weeklySchedule?: Maybe<Scalars['Iterable']['output']>;
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
  Rejected = 'Rejected',
}

export type Establishment = Node & {
  __typename?: 'Establishment';
  averageRating?: Maybe<Scalars['Float']['output']>;
  contractor: UserItem;
  contractorCut: Scalars['Float']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  crewCut: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  employeeCut: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  minimumWage: Scalars['Float']['output'];
  minimumWorkTimePerWeek: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  reviewCount: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
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
  allowedEmployees?: Maybe<EmployeeCursorConnection>;
  crewMembers?: Maybe<CrewMemberCursorConnection>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty: HeistDifficultyEnum;
  employee?: Maybe<Employee>;
  endedAt?: Maybe<Scalars['String']['output']>;
  establishment: Establishment;
  forbiddenUsers?: Maybe<UserCollectionCursorConnection>;
  id: Scalars['ID']['output'];
  location?: Maybe<Location>;
  maximumPayout: Scalars['Float']['output'];
  minimumPayout: Scalars['Float']['output'];
  minimumRequiredRating?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  objectives: Scalars['Iterable']['output'];
  phase: HeistPhaseEnum;
  preferedTactic: HeistPreferedTacticEnum;
  shouldEndAt: Scalars['String']['output'];
  startAt: Scalars['String']['output'];
  visibility: HeistVisibilityEnum;
};

export type HeistAllowedEmployeesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type HeistCrewMembersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type HeistForbiddenUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
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

export type Location = Node & {
  __typename?: 'Location';
  address?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  placeId?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for Location. */
export type LocationCursorConnection = {
  __typename?: 'LocationCursorConnection';
  edges?: Maybe<Array<Maybe<LocationEdge>>>;
  pageInfo: LocationPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Location. */
export type LocationEdge = {
  __typename?: 'LocationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Location>;
};

/** Information about the current page. */
export type LocationPageInfo = {
  __typename?: 'LocationPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type MeUser = Node & {
  __typename?: 'MeUser';
  balance: Scalars['Float']['output'];
  contractorRequest?: Maybe<ContractorRequest>;
  email?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<Employee>;
  /** You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  profile: Profile;
  roles: Scalars['Iterable']['output'];
  username: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Creates a ContractorRequest. */
  createContractorRequest?: Maybe<CreateContractorRequestPayload>;
  /** Creates a CrewMember. */
  createCrewMember?: Maybe<CreateCrewMemberPayload>;
  /** Creates a Employee. */
  createEmployee?: Maybe<CreateEmployeePayload>;
  /** Creates a Establishment. */
  createEstablishment?: Maybe<CreateEstablishmentPayload>;
  /** Creates a Heist. */
  createHeist?: Maybe<CreateHeistPayload>;
  /** Creates a Review. */
  createReview?: Maybe<CreateReviewPayload>;
  /** Creates a User. */
  createUser?: Maybe<CreateUserPayload>;
  /** Deletes a ContractorRequest. */
  deleteContractorRequest?: Maybe<DeleteContractorRequestPayload>;
  /** Deletes a CrewMember. */
  deleteCrewMember?: Maybe<DeleteCrewMemberPayload>;
  /** Deletes a Employee. */
  deleteEmployee?: Maybe<DeleteEmployeePayload>;
  /** Deletes a Establishment. */
  deleteEstablishment?: Maybe<DeleteEstablishmentPayload>;
  /** Deletes a Heist. */
  deleteHeist?: Maybe<DeleteHeistPayload>;
  /** Deletes a Review. */
  deleteReview?: Maybe<DeleteReviewPayload>;
  /** Deletes a User. */
  deleteUser?: Maybe<DeleteUserPayload>;
  /** Requests a Token. */
  requestToken?: Maybe<RequestTokenPayload>;
  /** Updates a ContractorRequest. */
  updateContractorRequest?: Maybe<UpdateContractorRequestPayload>;
  /** Updates a CrewMember. */
  updateCrewMember?: Maybe<UpdateCrewMemberPayload>;
  /** Updates a Employee. */
  updateEmployee?: Maybe<UpdateEmployeePayload>;
  /** Updates a Establishment. */
  updateEstablishment?: Maybe<UpdateEstablishmentPayload>;
  /** Updates a Heist. */
  updateHeist?: Maybe<UpdateHeistPayload>;
  /** Updates a Profile. */
  updateProfile?: Maybe<UpdateProfilePayload>;
  /** Updates a Review. */
  updateReview?: Maybe<UpdateReviewPayload>;
  /** Updates a User. */
  updateUser?: Maybe<UpdateUserPayload>;
  /** Validates a Employee. */
  validateEmployee?: Maybe<ValidateEmployeePayload>;
  /** Validates a User. */
  validateUser?: Maybe<ValidateUserPayload>;
};

export type MutationCreateContractorRequestArgs = {
  input: CreateContractorRequestInput;
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

export type MutationCreateReviewArgs = {
  input: CreateReviewInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationDeleteContractorRequestArgs = {
  input: DeleteContractorRequestInput;
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

export type MutationDeleteReviewArgs = {
  input: DeleteReviewInput;
};

export type MutationDeleteUserArgs = {
  input: DeleteUserInput;
};

export type MutationRequestTokenArgs = {
  input: RequestTokenInput;
};

export type MutationUpdateContractorRequestArgs = {
  input: UpdateContractorRequestInput;
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

export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type MutationUpdateReviewArgs = {
  input: UpdateReviewInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationValidateEmployeeArgs = {
  input: ValidateEmployeeInput;
};

export type MutationValidateUserArgs = {
  input: ValidateUserInput;
};

/** A node, according to the Relay specification. */
export type Node = {
  /** The id of this node. */
  id: Scalars['ID']['output'];
};

export type Profile = Node & {
  __typename?: 'Profile';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
};

/** Cursor connection for Profile. */
export type ProfileCursorConnection = {
  __typename?: 'ProfileCursorConnection';
  edges?: Maybe<Array<Maybe<ProfileEdge>>>;
  pageInfo: ProfilePageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Profile. */
export type ProfileEdge = {
  __typename?: 'ProfileEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Profile>;
};

/** Information about the current page. */
export type ProfilePageInfo = {
  __typename?: 'ProfilePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  contractorRequest?: Maybe<ContractorRequest>;
  contractorRequests?: Maybe<ContractorRequestCursorConnection>;
  crewMember?: Maybe<CrewMember>;
  crewMembers?: Maybe<CrewMemberCursorConnection>;
  employee?: Maybe<Employee>;
  employees?: Maybe<EmployeeCursorConnection>;
  establishment?: Maybe<Establishment>;
  establishments?: Maybe<EstablishmentCursorConnection>;
  getMeUser?: Maybe<MeUser>;
  heist?: Maybe<Heist>;
  heists?: Maybe<HeistCursorConnection>;
  location?: Maybe<Location>;
  locations?: Maybe<LocationCursorConnection>;
  node?: Maybe<Node>;
  profile?: Maybe<Profile>;
  profiles?: Maybe<ProfileCursorConnection>;
  review?: Maybe<Review>;
  reviews?: Maybe<ReviewCursorConnection>;
  token?: Maybe<Token>;
  tokens?: Maybe<TokenCursorConnection>;
  user?: Maybe<UserItem>;
  users?: Maybe<UserCollectionCursorConnection>;
};

export type QueryContractorRequestArgs = {
  id: Scalars['ID']['input'];
};

export type QueryContractorRequestsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['Iterable']['input']>;
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
  contractor__id?: InputMaybe<Scalars['String']['input']>;
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

export type QueryLocationArgs = {
  id: Scalars['ID']['input'];
};

export type QueryLocationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryProfileArgs = {
  id: Scalars['ID']['input'];
};

export type QueryProfilesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryReviewArgs = {
  id: Scalars['ID']['input'];
};

export type QueryReviewsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryTokenArgs = {
  id: Scalars['ID']['input'];
};

export type QueryTokensArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
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

export type Review = Node & {
  __typename?: 'Review';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<Establishment>;
  id: Scalars['ID']['output'];
  location?: Maybe<Location>;
  rating: ReviewRatingEnum;
  ratingNumber?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  user: UserItem;
};

/** Cursor connection for Review. */
export type ReviewCursorConnection = {
  __typename?: 'ReviewCursorConnection';
  edges?: Maybe<Array<Maybe<ReviewEdge>>>;
  pageInfo: ReviewPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Review. */
export type ReviewEdge = {
  __typename?: 'ReviewEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Review>;
};

/** Information about the current page. */
export type ReviewPageInfo = {
  __typename?: 'ReviewPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum ReviewRatingEnum {
  Five = 'Five',
  Four = 'Four',
  FourPointFive = 'FourPointFive',
  One = 'One',
  OnePointFive = 'OnePointFive',
  Three = 'Three',
  ThreePointFive = 'ThreePointFive',
  Two = 'Two',
  TwoPointFive = 'TwoPointFive',
  ZeroPointFive = 'ZeroPointFive',
}

export type Token = Node & {
  __typename?: 'Token';
  _id?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  resources: Scalars['Iterable']['output'];
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
};

/** Cursor connection for Token. */
export type TokenCursorConnection = {
  __typename?: 'TokenCursorConnection';
  edges?: Maybe<Array<Maybe<TokenEdge>>>;
  pageInfo: TokenPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Token. */
export type TokenEdge = {
  __typename?: 'TokenEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Token>;
};

/** Information about the current page. */
export type TokenPageInfo = {
  __typename?: 'TokenPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type UserCollection = Node & {
  __typename?: 'UserCollection';
  balance: Scalars['Float']['output'];
  contractorRequest?: Maybe<ContractorRequest>;
  email?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<Employee>;
  /** You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  profile: Profile;
  roles: Scalars['Iterable']['output'];
  username: Scalars['String']['output'];
};

/** Cursor connection for UserCollection. */
export type UserCollectionCursorConnection = {
  __typename?: 'UserCollectionCursorConnection';
  edges?: Maybe<Array<Maybe<UserCollectionEdge>>>;
  pageInfo: UserCollectionPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of UserCollection. */
export type UserCollectionEdge = {
  __typename?: 'UserCollectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<UserCollection>;
};

/** Information about the current page. */
export type UserCollectionPageInfo = {
  __typename?: 'UserCollectionPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type UserItem = Node & {
  __typename?: 'UserItem';
  balance: Scalars['Float']['output'];
  contractorRequest?: Maybe<ContractorRequest>;
  email?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<Employee>;
  /** You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  profile: Profile;
  roles: Scalars['Iterable']['output'];
  username: Scalars['String']['output'];
};

export enum UserLocaleEnum {
  En = 'En',
  Fr = 'Fr',
}

export enum UserStatusEnum {
  Dead = 'Dead',
  Unverified = 'Unverified',
  Verified = 'Verified',
}

/** Creates a ContractorRequest. */
export type CreateContractorRequestInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  reason: Scalars['String']['input'];
};

/** Creates a ContractorRequest. */
export type CreateContractorRequestPayload = {
  __typename?: 'createContractorRequestPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  contractorRequest?: Maybe<ContractorRequest>;
};

/** Creates a CrewMember. */
export type CreateCrewMemberInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  heist: Scalars['String']['input'];
};

/** Creates a CrewMember. */
export type CreateCrewMemberNestedPayload = Node & {
  __typename?: 'createCrewMemberNestedPayload';
  civilianCasualties: Scalars['Int']['output'];
  heist: CreateHeistNestedPayload;
  id: Scalars['ID']['output'];
  kills: Scalars['Int']['output'];
  objectivesCompleted: Scalars['Int']['output'];
  payout?: Maybe<Scalars['Float']['output']>;
  status: CrewMemberStatusEnum;
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
  heist: CreateHeistNestedPayload;
  id: Scalars['ID']['output'];
  kills: Scalars['Int']['output'];
  objectivesCompleted: Scalars['Int']['output'];
  payout?: Maybe<Scalars['Float']['output']>;
  status: CrewMemberStatusEnum;
  user: CreateUserNestedPayload;
};

/** Creates a Employee. */
export type CreateEmployeeInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  establishment: Scalars['String']['input'];
  motivation?: InputMaybe<Scalars['String']['input']>;
  weeklySchedule?: InputMaybe<Scalars['Iterable']['input']>;
};

/** Creates a Employee. */
export type CreateEmployeeNestedPayload = Node & {
  __typename?: 'createEmployeeNestedPayload';
  codeName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  establishment: CreateEstablishmentNestedPayload;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EmployeeStatusEnum>;
  user?: Maybe<CreateUserNestedPayload>;
  weeklySchedule?: Maybe<Scalars['Iterable']['output']>;
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
  codeName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  establishment: CreateEstablishmentNestedPayload;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EmployeeStatusEnum>;
  user?: Maybe<CreateUserNestedPayload>;
  weeklySchedule?: Maybe<Scalars['Iterable']['output']>;
};

/** Creates a Establishment. */
export type CreateEstablishmentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  contractorCut: Scalars['Float']['input'];
  crewCut: Scalars['Float']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  employeeCut: Scalars['Float']['input'];
  minimumWage: Scalars['Float']['input'];
  minimumWorkTimePerWeek: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

/** Creates a Establishment. */
export type CreateEstablishmentNestedPayload = Node & {
  __typename?: 'createEstablishmentNestedPayload';
  averageRating?: Maybe<Scalars['Float']['output']>;
  contractor: CreateUserNestedPayload;
  contractorCut: Scalars['Float']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  crewCut: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  employeeCut: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  minimumWage: Scalars['Float']['output'];
  minimumWorkTimePerWeek: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  reviewCount: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

/** Creates a Establishment. */
export type CreateEstablishmentPayload = {
  __typename?: 'createEstablishmentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<Establishment>;
};

/** Creates a Heist. */
export type CreateHeistInput = {
  allowedEmployees?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty: HeistDifficultyEnum;
  establishment: Scalars['String']['input'];
  forbiddenUsers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  maximumPayout: Scalars['Float']['input'];
  minimumPayout: Scalars['Float']['input'];
  minimumRequiredRating?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  objectives: Scalars['Iterable']['input'];
  preferedTactic: HeistPreferedTacticEnum;
  shouldEndAt: Scalars['String']['input'];
  startAt: Scalars['String']['input'];
  visibility: HeistVisibilityEnum;
};

/** Creates a Heist. */
export type CreateHeistNestedPayload = Node & {
  __typename?: 'createHeistNestedPayload';
  allowedEmployees?: Maybe<CreateEmployeeNestedPayloadCursorConnection>;
  crewMembers?: Maybe<CreateCrewMemberNestedPayloadCursorConnection>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty: HeistDifficultyEnum;
  employee?: Maybe<CreateEmployeeNestedPayload>;
  endedAt?: Maybe<Scalars['String']['output']>;
  establishment: CreateEstablishmentNestedPayload;
  forbiddenUsers?: Maybe<CreateUserNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  location?: Maybe<Location>;
  maximumPayout: Scalars['Float']['output'];
  minimumPayout: Scalars['Float']['output'];
  minimumRequiredRating?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  objectives: Scalars['Iterable']['output'];
  phase: HeistPhaseEnum;
  preferedTactic: HeistPreferedTacticEnum;
  shouldEndAt: Scalars['String']['output'];
  startAt: Scalars['String']['output'];
  visibility: HeistVisibilityEnum;
};

/** Creates a Heist. */
export type CreateHeistPayload = {
  __typename?: 'createHeistPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  heist?: Maybe<Heist>;
};

/** Creates a Review. */
export type CreateReviewInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  establishment?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  rating: ReviewRatingEnum;
};

/** Creates a Review. */
export type CreateReviewPayload = {
  __typename?: 'createReviewPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  review?: Maybe<Review>;
};

/** Creates a User. */
export type CreateUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  locale: UserLocaleEnum;
  plainPassword?: InputMaybe<Scalars['String']['input']>;
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

/** Deletes a ContractorRequest. */
export type DeleteContractorRequestInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Deletes a ContractorRequest. */
export type DeleteContractorRequestPayload = {
  __typename?: 'deleteContractorRequestPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  contractorRequest?: Maybe<DeleteContractorRequestPayloadData>;
};

/** Deletes a ContractorRequest. */
export type DeleteContractorRequestPayloadData = Node & {
  __typename?: 'deleteContractorRequestPayloadData';
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

/** Deletes a Review. */
export type DeleteReviewInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Deletes a Review. */
export type DeleteReviewPayload = {
  __typename?: 'deleteReviewPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  review?: Maybe<DeleteReviewPayloadData>;
};

/** Deletes a Review. */
export type DeleteReviewPayloadData = Node & {
  __typename?: 'deleteReviewPayloadData';
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

/** Requests a Token. */
export type RequestTokenInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The password of the user to authenticate. */
  password: Scalars['String']['input'];
  /** The username of the user to authenticate. */
  username: Scalars['String']['input'];
};

/** Requests a Token. */
export type RequestTokenPayload = {
  __typename?: 'requestTokenPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Token>;
};

/** Updates a ContractorRequest. */
export type UpdateContractorRequestInput = {
  adminComment?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status?: InputMaybe<ContractorRequestStatusEnum>;
};

/** Updates a ContractorRequest. */
export type UpdateContractorRequestNestedPayload = Node & {
  __typename?: 'updateContractorRequestNestedPayload';
  adminComment?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<ContractorRequestStatusEnum>;
};

/** Updates a ContractorRequest. */
export type UpdateContractorRequestPayload = {
  __typename?: 'updateContractorRequestPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  contractorRequest?: Maybe<ContractorRequest>;
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
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Updates a Employee. */
export type UpdateEmployeeNestedPayload = Node & {
  __typename?: 'updateEmployeeNestedPayload';
  codeName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<UpdateEstablishmentNestedPayload>;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EmployeeStatusEnum>;
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
  codeName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<UpdateEstablishmentNestedPayload>;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EmployeeStatusEnum>;
  user?: Maybe<UpdateUserNestedPayload>;
  weeklySchedule?: Maybe<Scalars['Iterable']['output']>;
};

/** Updates a Establishment. */
export type UpdateEstablishmentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  contractorCut?: InputMaybe<Scalars['Float']['input']>;
  crewCut?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  employeeCut?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  minimumWage?: InputMaybe<Scalars['Float']['input']>;
  minimumWorkTimePerWeek?: InputMaybe<Scalars['Int']['input']>;
};

/** Updates a Establishment. */
export type UpdateEstablishmentNestedPayload = Node & {
  __typename?: 'updateEstablishmentNestedPayload';
  averageRating?: Maybe<Scalars['Float']['output']>;
  contractor?: Maybe<UpdateUserNestedPayload>;
  contractorCut?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  crewCut?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  employeeCut?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  minimumWage?: Maybe<Scalars['Float']['output']>;
  minimumWorkTimePerWeek?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  reviewCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

/** Updates a Establishment. */
export type UpdateEstablishmentPayload = {
  __typename?: 'updateEstablishmentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<Establishment>;
};

/** Updates a Heist. */
export type UpdateHeistInput = {
  allowedEmployees?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<HeistDifficultyEnum>;
  forbiddenUsers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id: Scalars['ID']['input'];
  maximumPayout?: InputMaybe<Scalars['Float']['input']>;
  minimumPayout?: InputMaybe<Scalars['Float']['input']>;
  minimumRequiredRating?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  objectives?: InputMaybe<Scalars['Iterable']['input']>;
  preferedTactic?: InputMaybe<HeistPreferedTacticEnum>;
  shouldEndAt?: InputMaybe<Scalars['String']['input']>;
  startAt?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<HeistVisibilityEnum>;
};

/** Updates a Heist. */
export type UpdateHeistNestedPayload = Node & {
  __typename?: 'updateHeistNestedPayload';
  allowedEmployees?: Maybe<UpdateEmployeeNestedPayloadCursorConnection>;
  crewMembers?: Maybe<UpdateCrewMemberNestedPayloadCursorConnection>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<HeistDifficultyEnum>;
  employee?: Maybe<UpdateEmployeeNestedPayload>;
  endedAt?: Maybe<Scalars['String']['output']>;
  establishment?: Maybe<UpdateEstablishmentNestedPayload>;
  forbiddenUsers?: Maybe<UpdateUserNestedPayloadCursorConnection>;
  id: Scalars['ID']['output'];
  location?: Maybe<Location>;
  maximumPayout?: Maybe<Scalars['Float']['output']>;
  minimumPayout?: Maybe<Scalars['Float']['output']>;
  minimumRequiredRating?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  objectives?: Maybe<Scalars['Iterable']['output']>;
  phase?: Maybe<HeistPhaseEnum>;
  preferedTactic?: Maybe<HeistPreferedTacticEnum>;
  shouldEndAt?: Maybe<Scalars['String']['output']>;
  startAt?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<HeistVisibilityEnum>;
};

/** Updates a Heist. */
export type UpdateHeistPayload = {
  __typename?: 'updateHeistPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  heist?: Maybe<Heist>;
};

/** Updates a Profile. */
export type UpdateProfileInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Updates a Profile. */
export type UpdateProfileNestedPayload = Node & {
  __typename?: 'updateProfileNestedPayload';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
};

/** Updates a Profile. */
export type UpdateProfilePayload = {
  __typename?: 'updateProfilePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<Profile>;
};

/** Updates a Review. */
export type UpdateReviewInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  rating?: InputMaybe<ReviewRatingEnum>;
};

/** Updates a Review. */
export type UpdateReviewPayload = {
  __typename?: 'updateReviewPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  review?: Maybe<Review>;
};

/** Updates a User. */
export type UpdateUserInput = {
  balance?: InputMaybe<Scalars['Float']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  locale?: InputMaybe<UserLocaleEnum>;
  plainPassword?: InputMaybe<Scalars['String']['input']>;
};

/** Updates a User. */
export type UpdateUserNestedPayload = Node & {
  __typename?: 'updateUserNestedPayload';
  balance?: Maybe<Scalars['Float']['output']>;
  contractorRequest?: Maybe<UpdateContractorRequestNestedPayload>;
  email?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<UpdateEmployeeNestedPayload>;
  /** You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale?: Maybe<UserLocaleEnum>;
  profile?: Maybe<UpdateProfileNestedPayload>;
  roles?: Maybe<Scalars['Iterable']['output']>;
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
  balance?: Maybe<Scalars['Float']['output']>;
  contractorRequest?: Maybe<UpdateContractorRequestNestedPayload>;
  email?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<UpdateEmployeeNestedPayload>;
  /** You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale?: Maybe<UserLocaleEnum>;
  profile?: Maybe<UpdateProfileNestedPayload>;
  roles?: Maybe<Scalars['Iterable']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** Validates a Employee. */
export type ValidateEmployeeInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  codeName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status?: InputMaybe<EmployeeStatusEnum>;
};

/** Validates a Employee. */
export type ValidateEmployeeNestedPayload = Node & {
  __typename?: 'validateEmployeeNestedPayload';
  codeName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  establishment: Establishment;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EmployeeStatusEnum>;
  user?: Maybe<ValidateUserNestedPayload>;
  weeklySchedule?: Maybe<Scalars['Iterable']['output']>;
};

/** Validates a Employee. */
export type ValidateEmployeePayload = {
  __typename?: 'validateEmployeePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<ValidateEmployeePayloadData>;
};

/** Validates a Employee. */
export type ValidateEmployeePayloadData = Node & {
  __typename?: 'validateEmployeePayloadData';
  codeName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  establishment: Establishment;
  id: Scalars['ID']['output'];
  motivation?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EmployeeStatusEnum>;
  user?: Maybe<ValidateUserNestedPayload>;
  weeklySchedule?: Maybe<Scalars['Iterable']['output']>;
};

/** Validates a User. */
export type ValidateUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status: UserStatusEnum;
};

/** Validates a User. */
export type ValidateUserNestedPayload = Node & {
  __typename?: 'validateUserNestedPayload';
  balance: Scalars['Float']['output'];
  contractorRequest?: Maybe<ContractorRequest>;
  email?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<ValidateEmployeeNestedPayload>;
  /** You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  profile: Profile;
  roles: Scalars['Iterable']['output'];
  username: Scalars['String']['output'];
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
  contractorRequest?: Maybe<ContractorRequest>;
  email?: Maybe<Scalars['String']['output']>;
  employee?: Maybe<ValidateEmployeeNestedPayload>;
  /** You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  profile: Profile;
  roles: Scalars['Iterable']['output'];
  username: Scalars['String']['output'];
};
