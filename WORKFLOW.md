# 디자이너–개발자 협업 프로세스

## 목적

Figma에서 결정한 디자인 시스템을 `DESIGN.md`로 문서화하고, 같은 토큰을 Stitch·Tokens Studio·React 앱에서 사용한다. 디자인 시스템과 컴포넌트를 먼저 만든 뒤, 완성된 자산으로 실제 페이지를 구현한다.

## 역할과 파일

| 주체 | 책임 |
| --- | --- |
| 디자이너 | Figma 디자인 결정·변경 승인, 디자인 시스템·컴포넌트·페이지 설계, `DESIGN.md` 내용 검토와 전달 |
| 디자이너의 에이전트 | Figma 근거로 `design-md`를 실행해 `DESIGN.md` 및 토큰 산출물 생성·갱신 |
| 개발자 | 전달받은 버전을 코드베이스에 반영, Figma↔코드 매핑 확인, 컴포넌트·페이지 구현 |
| 개발자의 에이전트 | `components`와 `figma-implement` 실행, 필요한 `COMPONENTS.md` 매핑 갱신 |

`DESIGN.md`의 디자인 내용은 개발자가 임의로 수정하지 않는다. 구현 중 값이 누락되거나 충돌하면 디자이너가 Figma에서 결정을 확정한 뒤 문서와 토큰 산출물을 다시 생성한다. 개발자는 구현에 필요한 `DESIGN.md` 사본을 코드베이스에 둔다.

| 산출물 | 용도 |
| --- | --- |
| `DESIGN.md` | 사람이 읽는 디자인 원칙과 기계가 읽는 YAML 토큰. 디자인 결정의 공유 문서 |
| `tailwind.theme.css` | 같은 YAML 토큰에서 생성한 Tailwind 테마. React 앱에서 사용 |
| `tokens.studio.global.json` | 같은 YAML 토큰에서 생성한 Tokens Studio 토큰 세트. 디자이너가 Figma에 적용 |
| `COMPONENTS.md` | Figma 컴포넌트 이름·변형과 실제 코드 경로의 계약 |

## 1. 디자인 시스템 루프 — Figma 파일 A

1. 디자이너가 색상, 타이포그래피, 간격 등 최소 디자인 시스템을 Figma에 설계한다.
2. 디자이너가 1차 완료를 확정하고 Figma 대상 URL을 에이전트에 제공한다.
3. 에이전트가 `design-md`로 `DESIGN.md`, `tailwind.theme.css`, `tokens.studio.global.json`을 생성한다. `DESIGN.md` 형식은 번들된 Google 사양을 따른다.
4. 디자이너가 결과를 검토하고 `DESIGN.md`를 Stitch에, JSON을 Tokens Studio에 적용한다. 이 과정에서 디자인을 조정하면 Figma 결정과 산출물을 다시 맞춘다.
5. 디자이너가 동일한 토큰과 시스템을 사용해 컴포넌트를 만들고 Figma 라이브러리에 게시한다. Stitch를 사용할 수도 있고 Figma에서 직접 설계할 수도 있다.
6. 개발자가 게시된 컴포넌트 노드 URL로 `components`를 실행한다. `COMPONENTS.md`에 Figma 이름·변형·코드 경로를 기록한다. 아직 구현하지 않은 경로는 `pending`으로 둔다.
7. 개발자가 `figma-implement`로 React 컴포넌트를 구현한다. 구현된 경로로 `COMPONENTS.md`를 갱신한다.

디자인 시스템 또는 컴포넌트가 바뀌면 해당 단계부터 반복한다. 페이지 설계는 이 루프의 결과를 사용한다.

## 2. 페이지 루프 — Figma 파일 B

1. 디자이너가 게시된 컴포넌트와 디자인 시스템으로 `/login`, `/admin`, `/user-profile` 같은 배포 페이지를 조합한다.
2. 페이지가 완성되면 디자이너가 페이지 프레임 URL을 개발자에게 전달한다. 반응형 구현에는 같은 화면의 breakpoint별 프레임을 함께 전달한다.
3. 개발자가 `figma-implement`로 기존 `COMPONENTS.md` 매핑을 우선 사용해 라우트를 구현한다.
4. 새 공유 컴포넌트가 필요하거나 기존 매핑이 바뀌면 `COMPONENTS.md`를 갱신한다. 페이지 조합만 바뀐 경우에는 매핑을 억지로 추가하지 않는다.

## 변경 전달 규칙

디자이너가 Figma 디자인 시스템 변경을 확정하면 `design-md`로 세 산출물을 함께 갱신하고, 변경된 토큰·컴포넌트·영향받는 페이지를 개발자에게 전달한다. 개발자는 세 파일을 같은 버전으로 반영한다. 변경된 컴포넌트는 `components`와 `figma-implement`로 매핑·코드를 갱신한다. 변경된 페이지는 해당 프레임으로 다시 구현한다.

이 규칙에서 **디자인 결정의 승인자는 디자이너**, **토큰 산출물의 생성 기준은 `DESIGN.md` YAML**, **코드 반영 책임자는 개발자**다.

## 현재 스킬과 운영 모델의 차이

이 문서는 목표 협업 프로세스를 설명한다. 현재 `design-md`와 `figma-implement` 스킬에는 개발자가 `design-md`를 실행한다는 문구가 남아 있다. 또한 `design-md`는 프로젝트의 Tailwind·shadcn 설정을 확인하므로, 디자이너의 에이전트가 실행할 때도 해당 코드베이스를 읽을 수 있어야 완전한 산출물을 만들 수 있다. 스킬 자체는 이 문서를 만들면서 수정하지 않았다.
