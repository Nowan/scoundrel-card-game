import { ObservablePoint3D, PerspectiveCamera, PointData3D, Spring, SpringObjectValue, SpringValue } from "../../../../core/utils";
import { PerspectiveCard } from "../../components/card/PerspectiveCard";

export class DraggedCardsStack {
    cards: PerspectiveCard[];
    private readonly _cardsOffsets: Map<PerspectiveCard, PointData3D>;
    private readonly _followerCardsSprings: Map<PerspectiveCard, Spring>;
    private readonly _position3D: ObservablePoint3D;
    private readonly _camera: PerspectiveCamera;

    constructor(cards: PerspectiveCard[], camera: PerspectiveCamera) {
        this._position3D = new ObservablePoint3D(this._onPositionChanged.bind(this));
        this._camera = camera;

        this.cards = cards;

        this._cardsOffsets = new Map<PerspectiveCard, PointData3D>(
            cards.map((card, i) => ([card, {
                x: -(i + 1) * 15,
                y: 0,
                z: -(i + 1) * 10
            }]))
        );

        this._followerCardsSprings = new Map<PerspectiveCard, Spring>(
            this.followerCards.map(followerCard => ([followerCard, this._createCardSpring(followerCard, this._camera)]))
        );

        for (let [followerCard, followerCardSpring] of this._followerCardsSprings.entries()) {
            followerCardSpring.transitionTo(this._calculateSpringTargetPosition(followerCard))
        }
    }

    get topCard(): PerspectiveCard {
        return this.cards[0];
    }

    get followerCards(): PerspectiveCard[] {
        return this.cards.slice(1);
    }

    get position3D(): ObservablePoint3D {
        return this._position3D;
    }

    set position3D(position3D: PointData3D) {
        this._position3D.copyFrom(position3D);
    }

    pauseSprings() {
        for (let [followerCard, followerCardSpring] of this._followerCardsSprings.entries()) {
            followerCardSpring.destroy();
            this._followerCardsSprings.delete(followerCard);
        }
    }

    resumeSprings() {
        for (let followerCard of this.followerCards) {
            const followerCardSpring = this._createCardSpring(followerCard, this._camera);
            followerCardSpring.transitionTo(this._calculateSpringTargetPosition(followerCard));
            this._followerCardsSprings.set(followerCard, followerCardSpring);
        }
    }

    destroy() {
        for (let [followerCard, followerCardSpring] of this._followerCardsSprings.entries()) {
            followerCardSpring.destroy();
            this._followerCardsSprings.delete(followerCard);
        }
    }

    _onPositionChanged() {
        this._position3D.copyTo(this.topCard.position3D);
        this.topCard.updatePerspective(this._camera);

        for (let [followerCard, followerCardSpring] of this._followerCardsSprings.entries()) {
            followerCardSpring.transitionTo(this._calculateSpringTargetPosition(followerCard));
        }
    }

    _createCardSpring(card: PerspectiveCard, camera: PerspectiveCamera): Spring {
        const spring = new Spring({ ...card.position3D }, { precision: 10, damping: 20 });
        spring.onUpdate((value: SpringValue) => {
            card.position3D.x = (value as SpringObjectValue).x;
            card.position3D.y = (value as SpringObjectValue).y;
            card.position3D.z = (value as SpringObjectValue).z;
            card.updatePerspective(camera);
        });
        return spring;
    }

    _calculateSpringTargetPosition(card: PerspectiveCard): SpringObjectValue {
        const stackPosition = this.position3D;
        const cardOffset = this._cardsOffsets.get(card)!;

        return {
            x: stackPosition.x + cardOffset.x,
            y: stackPosition.y + cardOffset.y,
            z: stackPosition.z + cardOffset.z
        };
    }
}